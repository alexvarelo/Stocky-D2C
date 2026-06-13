import { Mail, Database, BarChart3, Code } from 'lucide-react';
import stockyLogo from '@/assets/stocky.png';

export const Footer = () => {
    return (
        <footer className="w-full border-t border-white/[0.08] bg-[#000000] py-8 mt-auto text-white/50">
            <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
                <div className="flex items-center gap-3">
                    <img
                        src={stockyLogo}
                        alt="Stocky"
                        className="h-8 w-8 grayscale opacity-70 hover:opacity-100 transition-opacity"
                    />
                    <span className="font-semibold text-white">Stocky</span>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 text-xs">
                    <div className="flex items-center gap-2 hover:text-white/70 transition-colors">
                        <BarChart3 className="h-3.5 w-3.5" />
                        <span>Data provided by Yahoo Finance (yfinance)</span>
                    </div>
                    <div className="flex items-center gap-2 hover:text-white/70 transition-colors">
                        <Database className="h-3.5 w-3.5" />
                        <span>Data management by Supabase</span>
                    </div>
                    <div className="flex items-center gap-2 hover:text-white/70 transition-colors">
                        <Mail className="h-3.5 w-3.5" />
                        <a href="mailto:stockyfolio@gmail.com">
                            stockyfolio@gmail.com
                        </a>
                    </div>
                    <div className="flex items-center gap-2 hover:text-white/70 transition-colors">
                        <Code className="h-3.5 w-3.5" />
                        <a href="https://stockfolio-api-229460767991.europe-west1.run.app/" target="_blank" rel="noopener noreferrer">
                            API for developers
                        </a>
                    </div>
                </div>

                <div className="text-xs text-white/30">
                    © {new Date().getFullYear()} Stockfolio. All rights reserved.
                </div>
            </div>
        </footer>
    );
};
