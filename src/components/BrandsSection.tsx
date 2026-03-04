export default function BrandsSection() {
  const brands = [
    "Hikvision",
    "Ubiquiti",
    "TP-Link",
    "Panduit",
    "Synology",
    "Grandstream",
    "ZKTeco",
    "DSC",
    "Mikrotik",
    "Dahua",
    "Cambium",
    "Cisco",
  ];

  return (
    <section className="py-12 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4">
        <p className="text-center text-sm text-gray-400 font-medium mb-8 uppercase tracking-wider">
          Marcas que distribuimos
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4">
          {brands.map((brand) => (
            <span
              key={brand}
              className="text-lg font-bold text-gray-300 hover:text-blue-600 transition-colors cursor-default"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
