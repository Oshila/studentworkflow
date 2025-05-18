import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import DashboardWrapper from "./DashboardWrapper";

export const metadata = {
  title: "Dashboard - Student Workflow",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardWrapper>{children}</DashboardWrapper>;
}
