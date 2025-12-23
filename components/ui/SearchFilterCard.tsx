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
        <div className="max-w-7xl mx-auto px-6 -mt-10 mb-16 relative z-20">
            <div className="bg-white rounded-[3rem] shadow-2xl p-8 md:p-12 border border-slate-100">
                <div className="flex flex-col lg:flex-row gap-8 items-center justify-between">
                    {/* Search Bar */}
                    <div className="w-full lg:max-w-md relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
                        <input
                            type="text"
                            placeholder={placeholder}
                            className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:outline-none focus:border-brand-blue transition-all font-bold text-lg text-brand-dark placeholder:text-slate-300"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>

                    {/* Category Filters */}
                    <div className="flex flex-wrap gap-4 justify-center">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => onCategoryChange(cat.id)}
                                className={`flex items-center gap-3 px-6 py-4 rounded-2xl font-black transition-all text-xs uppercase tracking-widest ${activeCategory === cat.id
                                    ? 'bg-brand-blue text-white shadow-xl shadow-brand-blue/30 -translate-y-1'
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                    }`}
                            >
                                <cat.icon size={18} />
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Popular Tags */}
                {tags && tags.length > 0 && (
                    <div className="mt-10 pt-8 border-t border-slate-50">
                        <div className="flex items-center gap-4 flex-wrap">
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Filter size={14} /> Filtre por Tags:
                            </span>
                            {tags.slice(0, 10).map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => onTagClick?.(tag)}
                                    className="px-4 py-2 bg-slate-50 text-slate-600 rounded-full text-xs font-bold hover:bg-brand-blue hover:text-white transition-all border border-slate-100"
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
