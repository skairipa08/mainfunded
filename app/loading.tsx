export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center space-y-4">
        <div className="relative mx-auto h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-blue-200" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin" />
        </div>
        <p className="text-gray-500 animate-pulse">Yükleniyor...</p>
      </div>
    </div>
  );
}
