import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createAdminDiscountApi,
  deleteAdminDiscountApi,
  listAdminDiscountsApi,
  type ProposalDiscount,
} from "@/lib/proposals-api";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Tag, Plus } from "@/components/Icons";

interface ProposalDiscountsManagerProps {
  adminKey: string;
  proposalId: string;
}

export function ProposalDiscountsManager({
  adminKey,
  proposalId,
}: ProposalDiscountsManagerProps) {
  const [discounts, setDiscounts] = useState<ProposalDiscount[]>([]);
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountValue, setDiscountValue] = useState<string>("10");
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  const loadDiscounts = async () => {
    setLoading(true);
    try {
      const res = await listAdminDiscountsApi(adminKey, proposalId);
      setDiscounts(res.discounts || []);
    } catch {
      // Ignore initial load failure if table empty
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDiscounts();
  }, [adminKey, proposalId]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await createAdminDiscountApi(adminKey, proposalId, {
        code: code.trim().toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue) || 0,
      });
      setDiscounts(res.discounts || []);
      setCode("");
      toast({ title: "تم إنشاء كود الخصم بنجاح" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "تعذر إنشاء الخصم",
        description: err instanceof Error ? err.message : "حدث خطأ غير متوقع",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (discountId: string) => {
    try {
      const res = await deleteAdminDiscountApi(adminKey, proposalId, discountId);
      setDiscounts(res.discounts || []);
      toast({ title: "تم حذف كود الخصم بنجاح" });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "تعذر حذف كود الخصم",
        description: err instanceof Error ? err.message : "حدث خطأ غير متوقع",
      });
    }
  };

  return (
    <div className="space-y-3 pt-3 border-t border-border/40 text-xs text-start dir-rtl">
      <div className="flex items-center gap-1.5 font-bold text-amber-400">
        <Tag className="w-3.5 h-3.5" />
        <span>إدارة كودات خصم الشركاء والخصومات الخاصة للعرض</span>
      </div>

      <form onSubmit={handleCreate} className="p-3 rounded-xl bg-muted/30 border border-border/50 space-y-2.5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="كود الخصم (مثال: NINU10)"
            className="text-xs bg-background uppercase font-mono"
            required
          />
          <select
            value={discountType}
            onChange={(e) => setDiscountType(e.target.value as "percentage" | "fixed")}
            className="text-xs bg-background border border-input rounded-md px-2.5 py-1.5 font-bold"
          >
            <option value="percentage">نسبة مئوية (%)</option>
            <option value="fixed">مبلغ ثابت ($)</option>
          </select>
          <Input
            type="number"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            placeholder="القيمة (مثال: 10 أو 500)"
            className="text-xs bg-background font-bold"
            required
            min={1}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" size="sm" disabled={submitting} className="text-xs font-bold gap-1 bg-amber-500 text-black hover:bg-amber-600">
            <Plus className="w-3.5 h-3.5" />
            {submitting ? "جارٍ الإضافة..." : "إضافة كود الخصم"}
          </Button>
        </div>
      </form>

      {/* Discounts List */}
      {loading ? (
        <p className="text-xs text-muted-foreground italic text-center p-2">جارٍ التحميل...</p>
      ) : discounts.length > 0 ? (
        <div className="space-y-1.5">
          {discounts.map((d) => (
            <div key={d.id} className="p-2.5 rounded-lg border border-border/40 bg-card flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                  {d.code}
                </span>
                <span className="text-foreground font-bold">
                  خصم {d.discountValue} {d.discountType === "percentage" ? "%" : "$"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(d.id)}
                className="text-destructive hover:text-destructive/80 p-1"
                title="حذف كود الخصم"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-muted-foreground italic text-center p-2">لا توجد كودات خصم مضافة لهذا العرض بعد.</p>
      )}
    </div>
  );
}
