"use client";

import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function PlaceholderPage({ title = "Page Under Construction" }) {
  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title={title} 
        description="This section is currently being improved to meet our premium standards."
      />
      <Card className="border-dashed border-2 py-20">
        <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground animate-pulse">
            <span className="text-2xl font-bold">...</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            We are working hard to bring you the best experience for {title.toLowerCase()}. Stay tuned.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
