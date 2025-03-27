import React from 'react'
import Documents from "../../components/Documents"
import Podcast from "../../components/Podcast" 
export const dynamic = "force-dynamic"
function Dashboard() {
    return (
        <div className=''>
            {/* div for pdf chat */}
            <div className="p-4 h-full max-w-7xl mx-auto">
                <h1 className="text-3xl p-5 bg-gray-100 font-extralight text-indigo-600">
                    My Documents
                </h1>
                {/* {Documents} */}
                <Documents />
            </div>
            
            {/* div for podcast thingy */}
            <div className="p-4 h-full max-w-7xl mx-auto">
                <h1 className="text-3xl p-5 bg-gray-100 font-extralight text-indigo-600">
                    My Podcasts
                </h1>
                {/* {Podcast} */}
                <Podcast />
            </div>
        </div>

    )
}

export default Dashboard