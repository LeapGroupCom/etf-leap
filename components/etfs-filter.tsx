"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";


type Tag = {
  id: string;
  name: string;
  slug: string;
}

type Category = {
  id: string;
  name: string;
  slug: string;
}

type FilterEtfsProps = {
  tags: Tag[];
  categories: Category[];
  selectedTag?: string;
  selectedCategory?: string;
}

export function FilterEtfs({
  tags,
  categories,
  selectedTag,
  selectedCategory,
}: FilterEtfsProps) {
  const router = useRouter();

  const handleFilterChange = (type: string, value: string) => {
    const newParams = new URLSearchParams(window.location.search);
    newParams.delete("page");

    if (value === "all") {
      newParams.delete(type)
    } else {
      newParams.set(type, value)
    }

    router.push(`/etfs?${newParams.toString()}`);
  };

  const handleResetFilters = () => {
    router.push("/etfs");
  };

  const hasTags = tags.length > 0;
  const hasCategories = categories.length > 0;

  return (
    <div className="grid md:grid-cols-[1fr_1fr_0.5fr] gap-2 my-4 z-10!">
      <Select
        value={selectedTag || "all"}
        onValueChange={(value) => handleFilterChange("tag", value)}
      >
        <SelectTrigger disabled={!hasTags}>
          {hasTags ? <SelectValue placeholder="All Tags" /> : "No tags found"}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tags</SelectItem>
          {tags.map((tag) => (
            <SelectItem key={tag.id} value={tag.slug}>
              {tag.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedCategory || "all"}
        onValueChange={(value) => handleFilterChange("category", value)}
      >
        <SelectTrigger disabled={!hasCategories}>
          {hasCategories ? (
            <SelectValue placeholder="All Categories" />
          ) : (
            "No categories found"
          )}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.slug}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={handleResetFilters}>
        Reset Filters
      </Button>
    </div>
  );
}
