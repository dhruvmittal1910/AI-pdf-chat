import React from 'react'
import { ClerkLoaded } from '@clerk/nextjs';
import { ReactNode } from 'react';
import Header from '@/components/Header';

function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <ClerkLoaded>
            <div className='flex flex-col flex-1 h-screen'>
                {/* header rendered out */}
                <Header />

                <main className='overflow-y-auto flex-1'>
                    {children}
                </main>
            </div>
        </ClerkLoaded>
    )
}

export default DashboardLayout