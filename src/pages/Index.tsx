
import DockAllocationDashboard from "@/components/DockAllocationDashboard";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Header stripe - marine color */}
      <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-marine-DEFAULT to-marine-light z-10"></div>
      
      <div className="relative z-20">
        <DockAllocationDashboard />
      </div>
      
      {/* Footer stripe - marine color */}
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-marine-DEFAULT to-marine-light z-10"></div>
    </div>
  );
};

export default Index;
