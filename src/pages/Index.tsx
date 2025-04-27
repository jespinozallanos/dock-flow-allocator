
import DockAllocationDashboard from "@/components/DockAllocationDashboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Franja azul superior - marine color */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-marine-DEFAULT z-10"></div>
      
      <div className="relative z-20">
        <DockAllocationDashboard />
      </div>
      
      {/* Franja azul inferior - marine color */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-marine-DEFAULT z-10"></div>
    </div>
  );
};

export default Index;
