import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function HRCharts({ data }) {
    // Defensive fallback if data is undefined/null to prevent Recharts crash
    const safeData = Array.isArray(data) && data.length > 0 ? data : [
        { range: '0-20', count: 0 },
        { range: '21-40', count: 0 },
        { range: '41-60', count: 0 },
        { range: '61-80', count: 0 },
        { range: '81-100', count: 0 }
    ];

    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={safeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis
                        dataKey="range"
                        stroke="#666"
                        fontSize={10}
                        tickFormatter={(val) => val}
                    />
                    <YAxis stroke="#666" fontSize={10} />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                        itemStyle={{ color: '#14b8a6', textTransform: 'uppercase', fontSize: '10px' }}
                    />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {safeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index > 3 ? '#14b8a6' : '#f43f5e'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <p className="text-[8px] text-gray-600 uppercase font-black mt-4 text-center">Score_Distribution_Curve</p>
        </div>
    );
}
