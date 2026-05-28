import AdminCouponForm from "@/components/admin/coupon-form";

export default function EditCouponPage({ params }: { params: { id: string } }) {
  return <AdminCouponForm params={params} />;
}
