import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "./ui/button";
import { FilePlus2, Gem, FileText } from "lucide-react";
import UpgradeButton from "./UpgradeButton";

function Header() {
    return (
        <div className="flex justify-between bg-white shadow-sm p-5 border-b">
            <Link href="/dashboard" className="text-2xl">
                <span className="text-2xl font-bold text-gray-900">Chat to{" "}</span>
                <span className="text-2xl font-bold text-indigo-600">PDF</span>
            </Link>

            <SignedIn>
                <div className="flex items-center space-x-2">
                    <Button asChild variant="outline" className="hidden md:flex">
                        <Link href="/dashboard/upgrade">
                            <Gem className="h-5 w-5" />
                            <span>Pricing</span>
                        </Link>
                    </Button>

                    <Button asChild variant="outline">
                        <Link href="/dashboard">
                            <FileText className="h-5 w-5" />
                            <span>My Documents</span>
                        </Link>
                    </Button>

                    <Button asChild variant="outline" className="border-indigo-600">
                        <Link href="/dashboard/upload">
                            <FilePlus2 className="text-indigo-600" />
                        </Link>
                    </Button>

                    {/* <UpgradeButton /> */}
                    <UpgradeButton/>

                    <UserButton />
                </div>
            </SignedIn>
        </div>
    );
}
export default Header;
