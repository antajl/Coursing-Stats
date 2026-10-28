import { spawn, execSync, type ChildProcess } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import type { Plugin } from 'vite'

function resolveCloudflaredBin(): string | null {
  const candidates = [
    'cloudflared',
    'C:\\Program Files (x86)\\cloudflared\\cloudflared.exe',
    'C:\\Program Files\\cloudflared\\cloudflared.exe',
    path.join(
      process.env.LOCALAPPDATA || '',
      'Microsoft',
      'WinGet',
      'Packages',
      'Cloudflare.cloudflared_Microsoft.Winget.Source_8wekyb3d8bbwe',
      'cloudflared.exe'
    ),
  ]

  for (const bin of candidates) {
    if (bin === 'cloudflared') {
      try {
        execSync('where cloudflared', { stdio: 'ignore' })
        return 'cloudflared'
      } catch {
        // Not directly on PATH in current shell
      }
    } else if (fs.existsSync(bin)) {
      return bin
    }
  }
  return null
}

/**
 * Vite plugin that automatically starts a Cloudflare Quick Tunnel when `yarn dev` starts,
 * printing a clickable HTTPS URL for instant testing from a mobile phone.
 */
export function cloudflareTunnelPlugin(): Plugin {
  let tunnelProc: ChildProcess | null = null
  const urlFilePath = path.resolve(__dirname, '.tunnel-url')

  return {
    name: 'vite-plugin-cloudflared',
    apply: 'serve',
    configureServer(server) {
      if (process.env.NO_TUNNEL === '1' || process.env.CI) {
        return
      }

      server.httpServer?.once('listening', () => {
        const address = server.httpServer?.address()
        const port = typeof address === 'object' && address?.port ? address.port : 5173
        const bin = resolveCloudflaredBin()

        if (!bin) {
          server.config.logger.warn(
            '  \x1b[33m[!]\x1b[0m cloudflared not found. Mobile tunnel skipped.'
          )
          return
        }

        try {
          tunnelProc = spawn(bin, ['tunnel', '--url', `http://localhost:${port}`], {
            stdio: ['ignore', 'pipe', 'pipe'],
          })

          let urlFound = false

          const onData = (data: Buffer) => {
            const text = data.toString()
            const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/)
            if (match && !urlFound) {
              urlFound = true
              const url = match[0]
              try {
                fs.writeFileSync(urlFilePath, url, 'utf8')
              } catch {
                // ignore
              }
              server.config.logger.info(
                `\n  \x1b[32m➜\x1b[0m  \x1b[1m\x1b[35mTunnel (phone):\x1b[0m \x1b[4m\x1b[36m${url}\x1b[0m\n`
              )
            }
          }

          tunnelProc.stdout?.on('data', onData)
          tunnelProc.stderr?.on('data', onData)

          tunnelProc.on('error', (err) => {
            server.config.logger.warn(`  \x1b[33m[!]\x1b[0m Cloudflare tunnel error: ${err.message}`)
          })

          const cleanup = () => {
            try {
              if (fs.existsSync(urlFilePath)) {
                fs.unlinkSync(urlFilePath)
              }
            } catch {
              // ignore
            }
            if (tunnelProc && !tunnelProc.killed) {
              try {
                tunnelProc.kill()
              } catch {
                // process already exited
              }
              tunnelProc = null
            }
          }

          server.httpServer?.on('close', cleanup)
          process.once('exit', cleanup)
          process.once('SIGINT', cleanup)
          process.once('SIGTERM', cleanup)
        } catch (err: any) {
          server.config.logger.warn(
            `  \x1b[33m[!]\x1b[0m Could not start Cloudflare tunnel: ${err?.message}`
          )
        }
      })
    },
  }
}
