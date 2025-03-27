import React from 'react'
import PlaceholderPodcast from './PlaceholderPodcast'

function Podcast() {
    return (
        <div className='flex flex-wrap p-5 bg-gray-100 justify-center lg:justify-start rounded-sm gap-5 max-w-7xl mx-auto'>
            {/* map through documents from firestore with respeect to each user */}
            <PlaceholderPodcast />
        </div>
    )
}

export default Podcast