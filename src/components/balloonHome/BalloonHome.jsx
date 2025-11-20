import React from "react"
import { useNavigate } from "react-router-dom"



export default function BalloonHome() {
    const navigate = useNavigate();
    return (
        <div className="font-display min-h-screen bg-background-light  flex flex-col">


            {/* HEADER */}
            <header className="w-full flex justify-center border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50">
                <div className="flex items-center justify-between px-6 sm:px-10 py-4 max-w-5xl w-full">
                    <div className="flex items-center gap-4 text-gray-900 dark:text-gray-100">
                        <div className="w-7 h-7 text-primary">
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold tracking-tight">Accenture Gaming Round Assessment</h2>
                    </div>
                </div>
            </header>


            {/* MAIN */}
            <main className="flex-1 flex justify-center p-4 sm:p-6 md:p-10">
                <div className="max-w-3xl w-full bg-white dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 rounded-xl shadow-md overflow-hidden">


                    {/* IMAGE */}
                    <div className="h-44 sm:h-52 md:h-60 w-full bg-center bg-cover"
                        style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuCniSr-jzGxZu_1quPtZfjvIXWPrgJwLTK-Q_MZ-DufVxQPLsOLGSAupeiaAft3hqYouww8dColCGxzT7E7J7JpEjDvE5nONCckp-Qc0EjNK5XSNRasdqxfsloEkgthaJbIAtDDp7XujyuezV9CNBZykKbT3xJJ79_icaA1Y9uKon5OcjM7AyBdmHu1OENoyWkY9B-Ztd7VvPMm8cdOptxUj7PE2Iusf2SZ4CoTYHYIiUIQeuxRfhRTq25jpZzECOztvfRLaxvaGyPI')` }}>
                    </div>


                    {/* CONTENT */}
                    <div className="p-6 sm:p-8 md:p-10 flex flex-col gap-8">
                        <div className="flex flex-col justify-between gap-3">
                                    <div className="flex min-w-72 flex-col gap-2">
                                        <p
                                            className="text-gray-900 dark:text-gray-50 text-4xl font-black leading-tight tracking-[-0.033em]">
                                            Math Balloon Game</p>
                                        <p
                                            className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal">
                                            Ready to test your skills? Here’s how to play.</p>
                                    </div>
                                </div>


                        {/* RULES */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">


                            <RuleCard title="25 Questions" desc="You will be presented with a total of 25 questions to solve." icon="🎯" />


                            <RuleCard title="15 Seconds Per Question" desc="You have a maximum of 15 seconds to answer each question." icon="⏳" />


                            <RuleCard title="Game Objective" desc="Select the three balloons in ascending order of their value." icon="🎈" />


                            <RuleCard title="Total Time: 5 Minutes" desc="The test will end automatically after 5 minutes." icon="⏱️" />


                        </div>


                        {/* WARNING */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 flex gap-3">
                            <span className="text-yellow-600 text-2xl">⚠️</span>
                            <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                                Total Time: 5 Minutes. Your score will be calculated automatically.
                            </p>
                        </div>


                        {/* BUTTON */}
                       <div className="mt-4 flex w-full">
                            <button
                                onClick={() => navigate("/balloon/game")}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-base font-semibold text-white transition-colors hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-background-dark">
                                <span>Start Game</span>
                                <span className="material-symbols-outlined !text-xl">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>


        </div>
    )
}


function RuleCard({ title, desc, icon }) {
    return (
        <div className="flex items-start gap-4">
            <div
                className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-12">
                <span className="material-symbols-outlined">{icon}</span>
            </div>
            <div className="flex flex-col justify-center">
                <p
                    className="text-gray-900 dark:text-gray-50 text-base font-medium leading-normal">
                    {title}</p>
                <p
                    className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">
                    {desc}</p>
            </div>
        </div>
    )
}
