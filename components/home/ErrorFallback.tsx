export default function ErrorFallback({ section }: { section: string }) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500">Unable to load {section} content. Please try again later.</p>
    </div>
  );
}