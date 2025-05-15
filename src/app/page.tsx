'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LabelList,
} from 'recharts';

export default function Home() {
  const [enrollmentData, setEnrollmentData] = useState<{ program_name: string, num_of_enrolled: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnrollmentData = async () => {
    const { data, error } = await supabase
      .from('enrolled_counter')
      .select('program_name, num_of_enrolled');

    if (error) {
      console.error('Error fetching enrollment data:', error);
    } else {
      setEnrollmentData(data);
    }
    setLoading(false);
  }; 
 
  useEffect(() => {
    // Initial fetch
    fetchEnrollmentData();

    // Realtime subscription
    const channel = supabase
      .channel('realtime-enrolled_counter')
      .on(
        'postgres_changes',
        {
          event: '*', // INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'enrolled_counter',
        },
        () => {
          // Re-fetch data on any change
          fetchEnrollmentData();
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="flex flex-col gap-8 p-4 items-center w-full h-screen">
      <h1 className="flex text-2xl font-bold">Enrollment Summary</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={enrollmentData}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="program_name"
              angle={-45}
              textAnchor="end"
              interval={0}
              height={100}
            />
            <YAxis />
            <Tooltip />
            <Bar dataKey="num_of_enrolled" fill="#3b82f6">
              <LabelList dataKey="num_of_enrolled" position="top" style={{ fontSize: '24px', fontWeight: 'semibold', fill: '#333' }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>

      )}
    </main>
  );
}
