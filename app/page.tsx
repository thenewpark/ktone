"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="container mx-auto md:p-8">
      <Link href="/analyze">
        <Button>진단하기</Button>
      </Link>
      <br />
      <Link href="/modify">
        <Button className="mt-4">수정하기</Button>
      </Link>
    </div>
  );
}
