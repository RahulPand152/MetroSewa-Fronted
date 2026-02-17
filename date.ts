export const CategoriesData = {
    sectionTitle: "Professional Home Services",
    sectionDescription:
        "Choose from our wide range of professional home services. Trusted by thousands for reliable and affordable solutions.",
    services: [
        {
            id: 1,
            title: "Plumbing",
            description:
                "Expert repair for leaks, pipe installations, and full bathroom solutions.",
            image: "https://picsum.photos/200/300?random=1",
            link: "/service/plumbing",
        },
        {
            id: 2,
            title: "Electrical",
            description:
                "Expert wiring, appliance repair, and comprehensive lighting solutions.",
            image: "https://picsum.photos/200/300?random=2",
            link: "/service/electrical",
        },
        {
            id: 3,
            title: "Computer/CCTV",
            description:
                "Network setup, PC repair, and professional security camera installation.",
            image: "https://picsum.photos/200/300?random=3",
            link: "/service/computer-cctv",
        },
        {
            id: 4,
            title: "Beauty & Salon",
            description:
                "Professional grooming, haircuts, and spa treatments delivered at home.",
            image: "https://picsum.photos/200/300?random=4",
            link: "/service/beauty-salon",
        },

        {
            id: 5,
            title: "AC Repair",
            description:
                "Servicing, gas charging, and installation for all air conditioner types.",
            image: "https://picsum.photos/200/300?random=5",
            link: "/service/ac-repair",
        },
    ],
};

export const SubServicesData = {
    "plumbing": [
        {
            "id": 1,
            "name": "Leak Repair",
            "description": "Fixing dripping faucets, leaking pipes, and hidden water leaks.",
            "image": "https://picsum.photos/200/300?random=1",
            "buttonText": "Book Now",
            "priority": false,
            "price": "Rs. 1,500",
            "duration": "45 Minutes",
            "rating": 4.8,
            "reviewsCount": 85,
            "longDescription": "Professional leak repair service to fix dripping faucets, leaking pipes, and hidden water leaks. We use advanced detection equipment to minimize damage and ensure a long-lasting fix.",
            "features": [
                "Advanced Leak Detection",
                "Pipe Replacement if needed",
                "Water Damage Assessment",
                "24/7 Emergency Support"
            ],
            "images": [
                "https://picsum.photos/800/600?random=1",
                "https://picsum.photos/800/600?random=101",
                "https://picsum.photos/800/600?random=102"
            ],
            "isPremium": false,
            "reviews": [
                {
                    "id": 1,
                    "user": "Ramesh P.",
                    "rating": 5,
                    "comment": "Excellent service! The plumber arrived on time and fixed the leak quickly.",
                    "date": "2 days ago",
                    "verified": true
                },
                {
                    "id": 2,
                    "user": "Sita K.",
                    "rating": 4,
                    "comment": "Good job, but a bit expensive.",
                    "date": "1 week ago",
                    "verified": true
                }
            ]
        },
        {
            "id": 2,
            "name": "Pipe Installation",
            "description": "Professional plumbing for new constructions, renovations, or pipe replacements.",
            "image": "https://picsum.photos/200/300",
            "buttonText": "Book Now",
            "priority": false,
            "price": "Rs. 3,500",
            "duration": "2-4 Hours",
            "rating": 4.7,
            "reviewsCount": 42,
            "longDescription": "Comprehensive pipe installation services for new constructions or renovations. We ensure all installations meet safety standards and use high-quality materials for durability.",
            "features": [
                "High-Quality PVC/CPVC Pipes",
                "Pressure Testing",
                "Leak-Proof Joint Sealing",
                "Warranty on Workmanship"
            ],
            "images": [
                "https://picsum.photos/800/600?random=2",
                "https://picsum.photos/800/600?random=103",
                "https://picsum.photos/800/600?random=104"
            ],
            "isPremium": false
        },
        {
            "id": 3,
            "name": "Bathroom Fitting",
            "description": "Installation of toilets, showers, sinks, and complete bathroom setups.",
            "image": "https://picsum.photos/200/300?random=3",
            "buttonText": "Book Now",
            "priority": false,
            "price": "Rs. 5,000",
            "duration": "3-6 Hours",
            "rating": 4.9,
            "reviewsCount": 110,
            "longDescription": "Upgrade your bathroom with our professional fitting services. From installing new commodes and sinks to complete shower setups, we handle it all with precision.",
            "features": [
                "Sanitary Ware Installation",
                "Shower Enclosure Setup",
                "Tile Work Coordination",
                "Custom Fittings"
            ],
            "images": [
                "https://picsum.photos/800/600?random=3",
                "https://picsum.photos/800/600?random=105",
                "https://picsum.photos/800/600?random=106"
            ],
            "isPremium": true
        },
        {
            "id": 4,
            "name": "Drain Cleaning",
            "description": "Clearing tough clogs in kitchen sinks, bathtubs, and main drainage lines.",
            "image": "https://picsum.photos/200/300?random=4",
            "buttonText": "Book Now",
            "priority": false,
            "price": "Rs. 2,000",
            "duration": "1 Hour",
            "rating": 4.6,
            "reviewsCount": 65,
            "longDescription": "Expert drain cleaning service to remove stubborn clogs and improve drainage flow. We use eco-friendly chemicals and mechanical snakes to clear pipes safely.",
            "features": [
                "Clog Removal",
                "Odor Elimination",
                "Preventive Maintenance Tips",
                "Safe Chemical Treatment"
            ],
            "images": [
                "https://picsum.photos/800/600?random=4",
                "https://picsum.photos/800/600?random=107",
                "https://picsum.photos/800/600?random=108"
            ],
            "isPremium": false
        },
        {
            "id": 5,
            "name": "Water Heater Service",
            "description": "Repair and maintenance for geysers and solar water heaters.",
            "image": "https://picsum.photos/200/300?random=5",
            "buttonText": "Book Now",
            "priority": false,
            "price": "Rs. 1,800",
            "duration": "1.5 Hours",
            "rating": 4.5,
            "reviewsCount": 30,
            "longDescription": "Reliable repair and maintenance for your water heaters. We service electric geysers and solar water heaters to ensure you have hot water when you need it.",
            "features": [
                "Element Replacement",
                "Thermostat Check",
                "Tank Cleaning",
                "Safety Valve Inspection"
            ],
            "images": [
                "https://picsum.photos/800/600?random=5",
                "https://picsum.photos/800/600?random=109",
                "https://picsum.photos/800/600?random=110"
            ],
            "isPremium": false
        },
        {
            "id": 6,
            "name": "Kitchen Plumbing",
            "description": "Sink installation, dishwasher hookups, and faucet repairs.",
            "image": "https://picsum.photos/200/300?random=6",
            "buttonText": "Book Now",
            "priority": false,
            "price": "Rs. 1,200",
            "duration": "45 Minutes",
            "rating": 4.7,
            "reviewsCount": 55,
            "longDescription": "Essential kitchen plumbing services including sink installation, faucet repairs, and dishwasher connections. Keep your kitchen running smoothly.",
            "features": [
                "Sink Installation/Repair",
                "Faucet Leak Fix",
                "Dishwasher Connection",
                "Garbage Disposal Service"
            ],
            "images": [
                "https://picsum.photos/800/600?random=6",
                "https://picsum.photos/800/600?random=111",
                "https://picsum.photos/800/600?random=112"
            ],
            "isPremium": false
        },
        {
            "id": 7,
            "name": "Pump Repair",
            "description": "Fast and reliable servicing for water lifting pumps and tanks.",
            "image": "https://picsum.photos/200/300?random=7",
            "buttonText": "Book Now",
            "priority": false,
            "price": "Rs. 2,200",
            "duration": "1-2 Hours",
            "rating": 4.6,
            "reviewsCount": 28,
            "longDescription": "Professional repair services for water pumps to restore water supply efficiently. We handle pressure pumps, submersible pumps, and more.",
            "features": [
                "Motor Winding Check",
                "Seal Replacement",
                "Pressure Switch Adjustment",
                "Noise Reduction"
            ],
            "images": [
                "https://picsum.photos/800/600?random=7",
                "https://picsum.photos/800/600?random=113",
                "https://picsum.photos/800/600?random=114"
            ],
            "isPremium": false
        },
        {
            "id": 8,
            "name": "Emergency Plumbing",
            "description": "Immediate response for burst pipes, flooding, or major blockages.",
            "image": "https://picsum.photos/200/300?random=8",
            "buttonText": "Book Now",
            "priority": true,
            "badge": "24/7 PRIORITY",
            "price": "Rs. 3,000",
            "duration": "Variable",
            "rating": 4.9,
            "reviewsCount": 200,
            "longDescription": "Immediate response for plumbing emergencies including burst pipes, severe leaks, and major blockages. We are available 24/7 to prevent water damage.",
            "features": [
                "30-Minute Response Time",
                "Disaster Mitigation",
                "Temporary & Permanent Fixes",
                "Insurance Documentation Support"
            ],
            "images": [
                "https://picsum.photos/800/600?random=8",
                "https://picsum.photos/800/600?random=115",
                "https://picsum.photos/800/600?random=116"
            ],
            "isPremium": true
        },
    ],
    "electrical": [
        {
            "id": 1,
            "name": "Wiring & Rewiring",
            "description": "Complete electrical wiring for new homes or renovations.",
            "image": "https://picsum.photos/200/300?random=10",
            "buttonText": "Book Now",
            "priority": false,
            "price": "Rs. 2,500",
            "duration": "1-3 Hours",
            "rating": 4.8,
            "reviewsCount": 92,
            "longDescription": "Complete electrical wiring services for new homes, renovations, or safety upgrades. Our certified electricians ensure everything is up to code.",
            "features": [
                "New Circuit Installation",
                "Safety Inspections",
                "Old Wiring Replacement",
                "Fuse Box Upgrades"
            ],
            "images": [
                "https://picsum.photos/800/600?random=10",
                "https://picsum.photos/800/600?random=117",
                "https://picsum.photos/800/600?random=118"
            ],
            "isPremium": false
        },
        {
            "id": 2,
            "name": "Appliance Repair",
            "description": "Repair services for fans, switches, and other electrical appliances.",
            "image": "https://picsum.photos/200/300?random=11",
            "buttonText": "Book Now",
            "priority": false,
            "price": "Rs. 800",
            "duration": "45 Minutes",
            "rating": 4.5,
            "reviewsCount": 60,
            "longDescription": "Quick and efficient repair for everyday electrical appliances. We fix ceiling fans, mixer grinders, switchboards, and more.",
            "features": [
                "Fan Motor Repair",
                "Switchboard Replacement",
                "Minor Appliance Fixes",
                "Voltage Check"
            ],
            "images": [
                "https://picsum.photos/800/600?random=11",
                "https://picsum.photos/800/600?random=119",
                "https://picsum.photos/800/600?random=120"
            ],
            "isPremium": false
        }
    ],
    "beauty-salon": [
        {
            "id": 1,
            "name": "Haircut & Styling",
            "description": "Professional haircut and styling services at home.",
            "image": "https://picsum.photos/200/300?random=20",
            "buttonText": "Book Now",
            "priority": false,
            "price": "Rs. 2,500",
            "duration": "60 Minutes",
            "rating": 4.8,
            "reviewsCount": 124,
            "longDescription": "Experience a transformative facial treatment designed for modern skin needs. Deep cleansing, hydration therapy and organic products restore your natural glow.",
            "features": [
                "Deep Cleansing",
                "Hydrating Mask",
                "Lymphatic Massage",
                "Organic Products"
            ],
            "images": [
                "https://picsum.photos/800/600?random=20",
                "https://picsum.photos/800/600?random=21",
                "https://picsum.photos/800/600?random=22"
            ],
            "isPremium": true,
            "reviews": [
                {
                    "id": 1,
                    "user": "Anjali S.",
                    "rating": 5,
                    "comment": "Absolutely loved the facial! My skin feels amazing.",
                    "date": "Yesterday",
                    "verified": true
                },
                {
                    "id": 2,
                    "user": "Priya M.",
                    "rating": 5,
                    "comment": "Very professional and relaxing. Highly recommend.",
                    "date": "3 days ago",
                    "verified": true
                },
                {
                    "id": 3,
                    "user": "Rita B.",
                    "rating": 4,
                    "comment": "Great experience, will book again.",
                    "date": "1 week ago",
                    "verified": false
                }
            ]
        },
        {
            "id": 2,
            "name": "Luxury Manicure",
            "description": "Premium manicure service with hand massage and polish.",
            "image": "https://picsum.photos/200/300?random=23",
            "buttonText": "Book Now",
            "priority": false,
            "price": "Rs. 1,500",
            "duration": "45 Minutes",
            "rating": 4.7,
            "reviewsCount": 58,
            "longDescription": "Treat your hands to a luxury manicure. Includes shaping, cuticle care, hand massage, and your choice of premium polish.",
            "features": [
                "Nail Shaping",
                "Cuticle Care",
                "Hand Massage",
                "Premium Polish"
            ],
            "images": [
                "https://picsum.photos/800/600?random=23",
                "https://picsum.photos/800/600?random=24",
                "https://picsum.photos/800/600?random=25"
            ],
            "isPremium": false
        }
    ],
    "deep-cleaning": [
        {
            "id": 1,
            "name": "Full Home Cleaning",
            "description": "Comprehensive deep cleaning for your entire home.",
            "image": "https://picsum.photos/200/300?random=30",
            "buttonText": "Book Now",
            "priority": false
        }
    ],
    "ac-repair": [
        {
            "id": 1,
            "name": "AC Service",
            "description": "Regular AC servicing and maintenance.",
            "image": "https://picsum.photos/200/300?random=40",
            "buttonText": "Book Now",
            "priority": false
        }
    ],
    "computer-cctv": [
        {
            "id": 1,
            "name": "PC Repair",
            "description": "Troubleshooting and repair for desktop and laptop computers.",
            "image": "https://picsum.photos/200/300?random=50",
            "buttonText": "Book Now",
            "priority": false
        }
    ],
};

// Fallback for backward compatibility if needed, though we should migrate usages
export const plumbingSubcategories = SubServicesData['plumbing'];


// Helper to flatten all sub-services for the main carousel
export const subServiceDatas = Object.entries(SubServicesData).flatMap(([slug, services]) => {
    return services.map((service) => ({
        ...service,
        title: service.name,
        link: `/service/${slug}/${service.id}`,
        // Create a unique ID by combining slug and ID, or just ensure uniqueness
        uniqueId: `${slug}-${service.id}`,
    }));
});
