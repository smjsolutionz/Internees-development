export default function StatCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
      <div
        className={`w-10 h-10 rounded-full ${color} flex items-center justify-center`}
      >
        <span className="w-2.5 h-2.5 rounded-full bg-white block" />
      </div>

      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-xl font-semibold">{value}</p>
      </div>
    </div>
  );
}
