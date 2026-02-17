
import ReceptionistSidebar from "../../components/receptionist/receptionistsidebar"
import Topbar from "../../components/admin/TopbarAdmin";
import Walkin from "../../components/receptionist/Walkin"

export default function Addgalleryimage() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <ReceptionistSidebar />
      <main className="flex-1">
        <Topbar />
        <div className="p-6">
          <Walkin/>
        </div>
      </main>
    </div>
  );
}
