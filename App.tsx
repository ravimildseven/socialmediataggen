import React, { useState, useCallback } from 'react';
import { Platform, TagResults, TagWithCategory, PopularityCategory } from './types';
import { generateTags } from './services/geminiService';
import { FacebookIcon, InstagramIcon, YouTubeIcon, CopyIcon, CheckIcon, SparklesIcon, FireIcon, TrendingUpIcon, UsersIcon, TargetIcon } from './components/icons';

const platformConfig = {
    [Platform.Facebook]: { icon: FacebookIcon, name: 'Facebook', color: 'bg-blue-600' },
    [Platform.Instagram]: { icon: InstagramIcon, name: 'Instagram', color: 'bg-pink-600' },
    [Platform.YouTube]: { icon: YouTubeIcon, name: 'YouTube', color: 'bg-red-600' },
};

const categoryConfig: Record<PopularityCategory, { icon: React.FC<{className?: string}>, color: string, text: string }> = {
    Viral: { icon: FireIcon, color: 'bg-red-500/20 text-red-300 ring-red-500/30', text: 'Viral' },
    High: { icon: TrendingUpIcon, color: 'bg-amber-500/20 text-amber-300 ring-amber-500/30', text: 'High' },
    Medium: { icon: UsersIcon, color: 'bg-sky-500/20 text-sky-300 ring-sky-500/30', text: 'Medium' },
    Niche: { icon: TargetIcon, color: 'bg-teal-500/20 text-teal-300 ring-teal-500/30', text: 'Niche' },
};

const TagResultCard: React.FC<{ platform: Platform; tags: TagWithCategory[] }> = ({ platform, tags }) => {
    const [copied, setCopied] = useState(false);
    const config = platformConfig[platform];

    const handleCopy = useCallback(() => {
        const tagString = tags.map(t => `#${t.tag.replace(/\s+/g, '')}`).join(' ');
        navigator.clipboard.writeText(tagString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [tags]);

    return (
        <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
            <div className={`p-4 flex items-center justify-between ${config.color}`}>
                <div className="flex items-center space-x-3">
                    <config.icon className="w-6 h-6 text-white" />
                    <h3 className="text-xl font-bold text-white">{config.name}</h3>
                </div>
                <button
                    onClick={handleCopy}
                    className="flex items-center px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white text-sm font-semibold transition-colors duration-200"
                >
                    {copied ? (
                        <>
                            <CheckIcon className="w-4 h-4 mr-1.5" />
                            Copied!
                        </>
                    ) : (
                        <>
                            <CopyIcon className="w-4 h-4 mr-1.5" />
                            Copy
                        </>
                    )}
                </button>
            </div>
            <div className="p-4 flex flex-wrap gap-2.5">
                {tags.map((tag, index) => {
                    const catConfig = categoryConfig[tag.category] || categoryConfig.Medium;
                    return (
                        <div key={index} className="bg-slate-700/50 flex items-center text-sm font-medium pr-3 pl-1.5 py-1 rounded-full ring-1 ring-slate-600">
                            <div className={`flex items-center gap-1.5 mr-2 rounded-full px-2 py-0.5 text-xs ring-1 ${catConfig.color}`}>
                                <catConfig.icon className="w-3 h-3"/>
                                <span>{catConfig.text}</span>
                            </div>
                            <span className="text-slate-200">{tag.tag}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const [description, setDescription] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>([]);
    const [tagResults, setTagResults] = useState<TagResults>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePlatformChange = (platform: Platform) => {
        setSelectedPlatforms(prev =>
            prev.includes(platform)
                ? prev.filter(p => p !== platform)
                : [...prev, platform]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim() || selectedPlatforms.length === 0) {
            setError('Please provide a description and select at least one platform.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setTagResults({});

        try {
            const results = await generateTags(description, selectedPlatforms);
            setTagResults(results);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 font-sans text-slate-200 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-10">
                    <div className="flex justify-center items-center gap-4 mb-4">
                        <SparklesIcon className="w-12 h-12 text-cyan-400"/>
                        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 to-cyan-300 text-transparent bg-clip-text">
                            Social Tag Wizard
                        </h1>
                    </div>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Describe your content and get AI-powered trending tags to maximize your views!
                    </p>
                </header>

                <main>
                    <div className="bg-slate-800/50 rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-700 backdrop-blur-sm">
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label htmlFor="description" className="block text-lg font-semibold mb-2 text-slate-300">
                                    1. Describe Your Content
                                </label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="e.g., A cinematic drone shot of a sunset over mountains"
                                    rows={4}
                                    className="w-full p-3 bg-slate-900 border-2 border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 placeholder-slate-500"
                                    disabled={isLoading}
                                ></textarea>
                            </div>

                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-3 text-slate-300">2. Select Platforms</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {Object.values(Platform).map(platform => {
                                        const config = platformConfig[platform];
                                        const isSelected = selectedPlatforms.includes(platform);
                                        return (
                                            <label
                                                key={platform}
                                                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                                                    isSelected ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 bg-slate-900 hover:border-slate-500'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handlePlatformChange(platform)}
                                                    className="hidden"
                                                    disabled={isLoading}
                                                />
                                                <config.icon className={`w-6 h-6 mr-3 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                                                <span className={`font-semibold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{config.name}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading || !description || selectedPlatforms.length === 0}
                                className="w-full flex items-center justify-center text-lg font-bold bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-600/20 disabled:shadow-none transform hover:scale-105"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating...
                                    </>
                                ) : 'Generate Tags'}
                            </button>
                        </form>
                    </div>

                    {error && (
                        <div className="mt-8 bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    {Object.keys(tagResults).length > 0 && (
                        <div className="mt-12">
                            <h2 className="text-3xl font-bold text-center mb-2">Your AI-Curated Tag Strategy</h2>
                            <p className="text-center text-slate-400 mb-8">
                                Tags are categorized by popularity to help you build the perfect mix for maximum reach.
                            </p>
                            <div className="grid grid-cols-1 gap-6">
                                {Object.entries(tagResults).map(([platform, tags]) => (
                                     tags && tags.length > 0 && <TagResultCard key={platform} platform={platform as Platform} tags={tags} />
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;