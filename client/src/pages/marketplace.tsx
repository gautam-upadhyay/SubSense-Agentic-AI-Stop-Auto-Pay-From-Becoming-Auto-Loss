import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Star, Zap, Shield } from "lucide-react";
import {
  SiNetflix,
  SiAmazon,
  SiSpotify,
  SiApple,
  SiYoutube,
  SiAdobe,
  SiDropbox,
  SiNotion,
  SiLinkedin,
  SiAmazonaws,
} from "react-icons/si";
import { FaDumbbell, FaGraduationCap, FaCloud, FaGamepad } from "react-icons/fa";
import type { Platform } from "@shared/schema";

const platforms: Platform[] = [
  {
    id: "netflix",
    name: "Netflix",
    logo: "netflix",
    category: "Entertainment",
    monthlyPrice: 649,
    yearlyPrice: 6999,
    description: "Unlimited movies, TV shows, and more",
    popular: true,
  },
  {
    id: "amazon-prime",
    name: "Amazon Prime",
    logo: "amazon",
    category: "Shopping",
    monthlyPrice: 299,
    yearlyPrice: 1499,
    description: "Free delivery, Prime Video & more",
    popular: true,
  },
  {
    id: "spotify",
    name: "Spotify",
    logo: "spotify",
    category: "Entertainment",
    monthlyPrice: 119,
    yearlyPrice: 1189,
    description: "Stream millions of songs ad-free",
    popular: true,
  },
  {
    id: "youtube-premium",
    name: "YouTube Premium",
    logo: "youtube",
    category: "Entertainment",
    monthlyPrice: 129,
    yearlyPrice: 1290,
    description: "Ad-free videos and YouTube Music",
  },
  {
    id: "apple-tv",
    name: "Apple TV+",
    logo: "apple",
    category: "Entertainment",
    monthlyPrice: 99,
    yearlyPrice: 999,
    description: "Award-winning Apple Originals",
  },
  {
    id: "aws",
    name: "AWS",
    logo: "aws",
    category: "Cloud Services",
    monthlyPrice: 2999,
    yearlyPrice: 29999,
    description: "Cloud computing services",
  },
  {
    id: "adobe-creative",
    name: "Adobe Creative",
    logo: "adobe",
    category: "Productivity",
    monthlyPrice: 4999,
    yearlyPrice: 49999,
    description: "Photoshop, Illustrator & more",
  },
  {
    id: "dropbox",
    name: "Dropbox",
    logo: "dropbox",
    category: "Storage",
    monthlyPrice: 999,
    yearlyPrice: 9999,
    description: "Secure cloud storage",
  },
  {
    id: "notion",
    name: "Notion",
    logo: "notion",
    category: "Productivity",
    monthlyPrice: 800,
    yearlyPrice: 8000,
    description: "All-in-one workspace",
  },
  {
    id: "linkedin-premium",
    name: "LinkedIn Premium",
    logo: "linkedin",
    category: "Professional",
    monthlyPrice: 2499,
    yearlyPrice: 17999,
    description: "Unlock career opportunities",
  },
  {
    id: "fitness-first",
    name: "Fitness First",
    logo: "gym",
    category: "Fitness",
    monthlyPrice: 2999,
    yearlyPrice: 29999,
    description: "Premium gym membership",
    popular: true,
  },
  {
    id: "coursera",
    name: "Coursera Plus",
    logo: "education",
    category: "Education",
    monthlyPrice: 3999,
    yearlyPrice: 39999,
    description: "Unlimited learning from top universities",
  },
  {
    id: "google-one",
    name: "Google One",
    logo: "cloud",
    category: "Storage",
    monthlyPrice: 130,
    yearlyPrice: 1300,
    description: "More storage for Google Drive",
  },
  {
    id: "xbox-game-pass",
    name: "Xbox Game Pass",
    logo: "gaming",
    category: "Gaming",
    monthlyPrice: 499,
    yearlyPrice: 4999,
    description: "Hundreds of games to play",
  },
];

const getPlatformIcon = (logo: string) => {
  const iconClass = "w-8 h-8";
  switch (logo) {
    case "netflix":
      return <SiNetflix className={`${iconClass} text-red-600`} />;
    case "amazon":
      return <SiAmazon className={`${iconClass} text-orange-500`} />;
    case "spotify":
      return <SiSpotify className={`${iconClass} text-green-500`} />;
    case "youtube":
      return <SiYoutube className={`${iconClass} text-red-500`} />;
    case "apple":
      return <SiApple className={`${iconClass} text-gray-800 dark:text-gray-200`} />;
    case "aws":
      return <SiAmazonaws className={`${iconClass} text-orange-400`} />;
    case "adobe":
      return <SiAdobe className={`${iconClass} text-red-500`} />;
    case "dropbox":
      return <SiDropbox className={`${iconClass} text-blue-500`} />;
    case "notion":
      return <SiNotion className={`${iconClass} text-gray-800 dark:text-gray-200`} />;
    case "linkedin":
      return <SiLinkedin className={`${iconClass} text-blue-600`} />;
    case "gym":
      return <FaDumbbell className={`${iconClass} text-purple-500`} />;
    case "education":
      return <FaGraduationCap className={`${iconClass} text-blue-600`} />;
    case "cloud":
      return <FaCloud className={`${iconClass} text-blue-500`} />;
    case "gaming":
      return <FaGamepad className={`${iconClass} text-green-600`} />;
    default:
      return <Zap className={`${iconClass} text-primary`} />;
  }
};

const categories = ["All", "Entertainment", "Shopping", "Productivity", "Storage", "Cloud Services", "Fitness", "Education", "Gaming", "Professional"];

export default function Marketplace() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredPlatforms = platforms.filter((platform) => {
    const matchesSearch = platform.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      platform.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || platform.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularPlatforms = platforms.filter((p) => p.popular);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto" data-testid="page-marketplace">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 rounded-lg border border-primary/20">
        <div className="flex items-center gap-2 text-primary">
          <Shield className="w-5 h-5" />
          <span className="text-sm font-medium">Sandbox / Demo Mode – No real money is transferred</span>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subscription Marketplace</h1>
        <p className="text-muted-foreground">
          Subscribe to your favorite services with AI-powered protection
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search platforms..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          data-testid="input-search-platforms"
        />
      </div>

      {searchQuery === "" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold">Popular Subscriptions</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularPlatforms.map((platform) => (
              <Card
                key={platform.id}
                className="hover-elevate cursor-pointer active-elevate-2 transition-transform border-primary/20"
                onClick={() => setLocation(`/pay/${platform.id}`)}
                data-testid={`card-platform-${platform.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-muted">
                      {getPlatformIcon(platform.logo)}
                    </div>
                    <Badge variant="secondary" className="text-xs">Popular</Badge>
                  </div>
                  <h3 className="font-semibold mb-1">{platform.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{platform.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold">{formatCurrency(platform.monthlyPrice)}</span>
                    <span className="text-xs text-muted-foreground">/month</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Tabs defaultValue="All" value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-transparent p-0">
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-1.5 text-sm"
              data-testid={`tab-category-${category.toLowerCase().replace(' ', '-')}`}
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPlatforms.map((platform) => (
              <Card
                key={platform.id}
                className="hover-elevate cursor-pointer active-elevate-2 transition-transform"
                onClick={() => setLocation(`/pay/${platform.id}`)}
                data-testid={`card-platform-${platform.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-muted">
                      {getPlatformIcon(platform.logo)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{platform.name}</h3>
                      <Badge variant="outline" className="text-xs">{platform.category}</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{platform.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold">{formatCurrency(platform.monthlyPrice)}</span>
                        <span className="text-xs text-muted-foreground">/mo</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(platform.yearlyPrice)}/yr
                      </p>
                    </div>
                    <Button size="sm" data-testid={`button-subscribe-${platform.id}`}>
                      Subscribe
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {filteredPlatforms.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No platforms found matching your search</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
