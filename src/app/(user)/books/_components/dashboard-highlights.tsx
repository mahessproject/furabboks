import Link from "next/link";
import Image from "next/image";
import { PlayCircle, BookOpen, Truck } from "lucide-react";
import type { Order } from "@/types";

export default function DashboardHighlights({ activeOrder }: { activeOrder?: any }) {
  return (
    <section className="py-2 px-4 sm:px-0">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Continue Reading Card */}
        <div className="md:col-span-2 bg-violet-600 rounded-[32px] p-8 text-white flex items-center justify-between overflow-hidden relative group shadow-sm shadow-violet-200">
          <div className="space-y-4 z-10 w-full">
            <div className="flex items-center gap-2 text-violet-200 text-xs font-bold uppercase tracking-widest">
              <PlayCircle className="w-4 h-4" /> Buku Favorit Anda
            </div>
            <h2 className="text-2xl font-bold max-w-sm">Temukan Bacaan Terbaik Minggu Ini</h2>
            <p className="text-sm text-violet-100 max-w-xs leading-relaxed">
              Jelajahi koleksi buku kami dan mulai baca dari halaman terakhir Anda tinggalkan.
            </p>
            <Link href="/books" className="inline-block bg-white text-violet-600 px-6 py-2.5 rounded-xl text-sm font-bold shadow hover:bg-violet-50 transition">
              Lihat Katalog
            </Link>
          </div>
          <div className="hidden sm:block absolute -right-4 -bottom-10 opacity-20 group-hover:opacity-30 transition rotate-12 pointer-events-none">
            <BookOpen className="w-64 h-64 text-white" />
          </div>
        </div>

        {/* Active Order Card */}
        <div className="bg-white border border-violet-100 rounded-[32px] p-8 shadow-sm shadow-violet-50 flex flex-col justify-between hover:border-violet-300 transition">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-violet-950">Pesanan Terakhir</h3>
              {activeOrder ? (
                <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                  activeOrder.status === 'shipped' ? 'bg-amber-100 text-amber-700' :
                  activeOrder.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                  activeOrder.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {activeOrder.status === 'shipped' ? 'Dikirim' :
                   activeOrder.status === 'confirmed' ? 'Diproses' :
                   activeOrder.status === 'pending' ? 'Pending' : 'Selesai'}
                </span>
              ) : (
                <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase">
                  Kosong
                </span>
              )}
            </div>
            
            {activeOrder && activeOrder.order_items?.[0]?.books ? (
              <div className="flex items-center gap-4 py-2">
                <div className="w-12 h-16 bg-violet-100 rounded-lg flex-shrink-0 relative overflow-hidden border border-violet-100">
                  {activeOrder.order_items[0].books.cover_url && (
                    <Image src={activeOrder.order_items[0].books.cover_url} alt="Cover" fill className="object-cover" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold line-clamp-1 text-violet-900">{activeOrder.order_items[0].books.title}</p>
                  <p className="text-xs font-medium text-violet-500 mt-1 flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    Detail pesanan
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-xs font-medium text-violet-400">Belum ada pesanan aktif bulan ini.</p>
              </div>
            )}
          </div>
          
          <Link href="/orders" className="w-full text-center py-3 text-sm font-bold text-violet-600 bg-violet-50/50 hover:bg-violet-100/80 rounded-xl transition mt-4 border border-violet-100">
            {activeOrder ? "Lacak Pesanan" : "Mulai Belanja"}
          </Link>
        </div>
      </div>
    </section>
  );
}
