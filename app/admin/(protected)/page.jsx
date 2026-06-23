import AdminDashboardPage from "./dashboard/page";

export const dynamic = "force-dynamic";
export const metadata = { title: "数据总览 | Cowinmagnet.cl Admin" };

export default function AdminIndexPage(props) {
  return <AdminDashboardPage {...props} />;
}
