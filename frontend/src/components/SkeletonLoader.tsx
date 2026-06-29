export default function SkeletonLoader({ message = 'Загрузка...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-8 h-8 border-4 border-old-money-300 border-t-camel-500 rounded-full animate-spin" />
      <p className="text-old-money-500 dark:text-old-money-400 text-sm">{message}</p>
    </div>
  )
}
