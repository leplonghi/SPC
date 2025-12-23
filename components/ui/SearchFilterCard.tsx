import React from 'react';
import { Search, Filter, LucideIcon } from 'lucide-react';

export interface FilterCategory {
    id: string;
    label: string;
    icon: LucideIcon;
}

interface SearchFilterCardProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    placeholder?: string;
    categories: FilterCategory[];
    activeCategory: string;
    onCategoryChange: (id: string) => void;
    tags?: string[];
    onTagClick?: (tag: string) => void;
}

export const SearchFilterCard: React.FC<SearchFilterCardProps> = ({
    searchTerm,
    onSearchChange,
    placeholder = "Pesquisar...",
    categories,
    activeCategory,
    onCategoryChange,
    tags,
    onTagClick
}) => {
    return (
        <div className="max-w-7xl mx-auto px-6 -mt-6 mb-8 relative z-20">
            <div className="bg-white rounded-2xl shadow-xl p-4 border border-slate-100">
                <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    {/* Search Bar */}
                    <div className="w-full lg:max-w-md relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder={placeholder}
                            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-2 border-slate-100 rounded-xl focus:outline-none focus:border-brand-blue transition-all font-bold text-xs text-brand-dark placeholder:text-slate-300"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>

                    {/* Category Filters */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => onCategoryChange(cat.id)}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-black transition-all text-[10px] uppercase tracking-widest ${activeCategory === cat.id
                                    ? 'bg-brand-blue text-white shadow-lg shadow-brand-blue/30 -translate-y-1'
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                    }`}
                            >
                                <cat.icon size={14} />
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Popular Tags */}
                {tags && tags.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Filter size={10} /> Filtre por Tags:
                            </span>
                            {tags.slice(0, 10).map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => onTagClick?.(tag)}
                                    className="px-2 py-1 bg-slate-50 text-slate-600 rounded-md text-[9px] font-bold hover:bg-brand-blue hover:text-white transition-all border border-slate-100"
                                >
                                    #{tag}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
