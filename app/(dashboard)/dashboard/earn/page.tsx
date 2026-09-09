'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet } from 'lucide-react';
import { SaveTab } from '@/components/Earn/SaveTab';
import { LendTab } from '@/components/Earn/LendTab';
import { BorrowTab } from '@/components/Earn/BorrowTab';

export default function EarnPage() {
  const [activeTab, setActiveTab] = useState('save');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
          <Wallet className="h-6 w-6" />
          Earn
        </h1>
        <p className="text-sm text-muted-foreground">
          Maximize your PUSD. Lend, borrow, or save to earn yield.
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-muted/50 p-1 rounded-xl h-11">
          <TabsTrigger 
            value="save" 
            className="rounded-lg text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            Save
          </TabsTrigger>
          <TabsTrigger 
            value="lend"
            className="rounded-lg text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            Lend
          </TabsTrigger>
          <TabsTrigger 
            value="borrow"
            className="rounded-lg text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm"
          >
            Borrow
          </TabsTrigger>
        </TabsList>

        <TabsContent value="save" className="animate-fade-in">
          <SaveTab />
        </TabsContent>

        <TabsContent value="lend" className="animate-fade-in">
          <LendTab />
        </TabsContent>

        <TabsContent value="borrow" className="animate-fade-in">
          <BorrowTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}