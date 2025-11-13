type TableHeaderProps = {
  children: React.ReactNode;
};

export default function TableHeader({ children }: TableHeaderProps) {
  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-200">
      {children}
    </div>
  );
}
