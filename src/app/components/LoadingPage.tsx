import Image from "next/image";

export default function Loading() {
    return (
        <main className="flex items-center justify-center h-screen flex-col">
            <Image src="/img/lsc-green-logo.png" width={160} height={160} alt="loading_logo" />

        </main>
    );
}
