import { useEffect, useState } from "react";
import ProposalAdmin from "@/pages/admin/ProposalAdmin";
import ShortlinksAdmin from "@/pages/admin/ShortlinksAdmin";

type AdminSection = "proposals" | "shortlinks";

function sectionFromLocation(): AdminSection {
  return new URLSearchParams(window.location.search).get("section") === "shortlinks"
    ? "shortlinks"
    : "proposals";
}

export default function Admin() {
  const [section, setSection] = useState<AdminSection>(sectionFromLocation);
  const [sessionEpoch, setSessionEpoch] = useState(0);

  useEffect(() => {
    const handlePopState = () => setSection(sectionFromLocation());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    document.title =
      section === "shortlinks"
        ? "الروابط المختصرة | NinuSoft"
        : "إدارة العروض | NinuSoft";
  }, [section]);

  const navigate = (next: AdminSection) => {
    const url = next === "proposals" ? "/admin" : `/admin?section=${next}`;
    window.history.pushState({}, "", url);
    setSection(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => setSessionEpoch((current) => current + 1);

  return (
    <>
      <div hidden={section !== "proposals"}>
        <ProposalAdmin
          key={`proposals-${sessionEpoch}`}
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      </div>
      <div hidden={section !== "shortlinks"}>
        <ShortlinksAdmin
          key={`shortlinks-${sessionEpoch}`}
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      </div>
    </>
  );
}
