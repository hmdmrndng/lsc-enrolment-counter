'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LabelList,
} from 'recharts';

export default function Home() {
  const [enrollmentData, setEnrollmentData] = useState<{ id: number, program_name: string, num_of_enrolled: number }[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnrollmentData = async () => {
    const { data, error } = await supabase
      .from('enrolled_counter')
      .select('id, program_name, num_of_enrolled');

    if (error) {
      console.error('Error fetching enrollment data:', error);
    } else {
      const sortedData = data.sort((a, b) => a.id - b.id);
      setEnrollmentData(sortedData);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEnrollmentData();

    const channel = supabase
      .channel('realtime-enrolled_counter')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'enrolled_counter',
        },
        () => {
          fetchEnrollmentData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <main className="flex flex-col items-center w-full h-screen">
      <section className='flex flex-col items-center w-full p-4'>
        <Image
          src="/img/lsc-logo.png"
          alt="LSC Logo"
          width={150}
          height={150}
        />
        <h1 className="flex text-2xl font-bold ">Enrollment Summary</h1>
      </section>
      <section className='flex flex-col w-full items-center h-full'>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={enrollmentData}
              margin={{ top: 20, right: 30, left: 20, bottom: 120 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="program_name"
                angle={-30}
                textAnchor="end"
                interval={0}
                height={100}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="num_of_enrolled" fill="#356854">
                <LabelList dataKey="num_of_enrolled" position="top" style={{ fontSize: '24px', fontWeight: 'semibold', fill: '#333' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>

        )}
      </section>
    </main>
  );
}
