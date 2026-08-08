export default function ExploreLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen w-screen">
            <main>{children}</main>
        </div>
    );
}