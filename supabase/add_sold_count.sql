-- Tambah kolom sold_count ke tabel books
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS sold_count INTEGER NOT NULL DEFAULT 0;

-- Trigger function: otomatis increment sold_count saat order_item dibuat
CREATE OR REPLACE FUNCTION public.update_book_sold_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.books
  SET sold_count = sold_count + NEW.quantity
  WHERE id = NEW.book_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_order_item_created
  AFTER INSERT ON public.order_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_book_sold_count();
