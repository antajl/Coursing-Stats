export default function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20" role="status" aria-label="Загрузка">
      <div className="w-8 h-8 border-2 border-camel-600 dark:border-camel-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
