import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import TabNavigator from "./components/TabNavigator";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Oura Ring Dashboard",
  description: "Employee sleep health monitoring using Oura Ring data",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-100">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Oura Ring Employee Health Dashboard
              </h1>
              {/* Tab navigation for different sections of the dashboard */}
              <div className="mt-4">
                <TabNavigator />
              </div>
            </div>
          </header>
          {/* Main content area where page-specific content is rendered */}
          <main>
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
