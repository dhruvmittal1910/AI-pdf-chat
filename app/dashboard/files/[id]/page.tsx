import Chat from "@/components/Chat";
import PdfView from "@/components/PdfView";
import { adminDb } from "@/firebaseAdmin";
import { auth } from "@clerk/nextjs/server";

// async function getItem(id: string) {
//     const res = await fetch(`https://your-api/items/${id}`, { cache: 'no-store' });
//     return res.json();
// }

async function ChatToFilePage({ params }: { params: Promise<{ id: string }> }) {
    auth().protect();
    const { userId } = await auth();
    const { id } = await params
    // const item = await getItem(id)
    const ref = await adminDb
        .collection("users")
        .doc(userId!)
        .collection("files")
        .doc(id)
        .get();

    const url = ref.data()?.downloadUrl;

    return (
        <div className="grid lg:grid-cols-5 h-full overflow-hidden">
            {/* Right */}
            <div className="col-span-5 lg:col-span-2 overflow-y-auto">
                {/* Chat */}
                <Chat id={id} />
            </div>

            {/* Left */}
            <div className="col-span-5 lg:col-span-3 bg-gray-100 border-r-2 lg:border-indigo-600 lg:-order-1 overflow-auto">
                {/* PDFView */}
                <PdfView url={url} />
            </div>
        </div>
    );
}
export default ChatToFilePage;