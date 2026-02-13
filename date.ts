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
            title: "Deep Cleaning",
            description:
                "Deep home cleaning, sofa sanitization, and professional cleaning services.",
            image: "https://picsum.photos/200/300?random=5",
            link: "/service/deep-cleaning",
        },
        {
            id: 6,
            title: "AC Repair",
            description:
                "Servicing, gas charging, and installation for all air conditioner types.",
            image: "https://picsum.photos/200/300?random=6",
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
            "priority": false
        },
        {
            "id": 2,
            "name": "Pipe Installation",
            "description": "Professional plumbing for new constructions, renovations, or pipe replacements.",
            "image": "https://picsum.photos/200/300",
            "buttonText": "Book Now",
            "priority": false
        },
        {
            "id": 3,
            "name": "Bathroom Fitting",
            "description": "Installation of toilets, showers, sinks, and complete bathroom setups.",
            "image": "https://picsum.photos/200/300?random=3",
            "buttonText": "Book Now",
            "priority": false
        },
        {
            "id": 4,
            "name": "Drain Cleaning",
            "description": "Clearing tough clogs in kitchen sinks, bathtubs, and main drainage lines.",
            "image": "https://picsum.photos/200/300?random=4",
            "buttonText": "Book Now",
            "priority": false
        },
        {
            "id": 5,
            "name": "Water Heater Service",
            "description": "Repair and maintenance for geysers and solar water heaters.",
            "image": "https://picsum.photos/200/300?random=5",
            "buttonText": "Book Now",
            "priority": false
        },
        {
            "id": 6,
            "name": "Kitchen Plumbing",
            "description": "Sink installation, dishwasher hookups, and faucet repairs.",
            "image": "https://picsum.photos/200/300?random=6",
            "buttonText": "Book Now",
            "priority": false
        },
        {
            "id": 7,
            "name": "Pump Repair",
            "description": "Fast and reliable servicing for water lifting pumps and tanks.",
            "image": "https://picsum.photos/200/300?random=7",
            "buttonText": "Book Now",
            "priority": false
        },
        {
            "id": 8,
            "name": "Emergency Plumbing",
            "description": "Immediate response for burst pipes, flooding, or major blockages.",
            "image": "https://picsum.photos/200/300?random=8",
            "buttonText": "Book Now",
            "priority": true,
            "badge": "24/7 PRIORITY"
        }
    ],
    "electrical": [
        {
            "id": 1,
            "name": "Wiring & Rewiring",
            "description": "Complete electrical wiring for new homes or renovations.",
            "image": "https://picsum.photos/200/300?random=10",
            "buttonText": "Book Now",
            "priority": false
        },
        {
            "id": 2,
            "name": "Appliance Repair",
            "description": "Repair services for fans, switches, and other electrical appliances.",
            "image": "https://picsum.photos/200/300?random=11",
            "buttonText": "Book Now",
            "priority": false
        }
    ],
    "beauty-salon": [
        {
            "id": 1,
            "name": "Haircut & Styling",
            "description": "Professional haircut and styling services at home.",
            "image": "https://picsum.photos/200/300?random=20",
            "buttonText": "Book Now",
            "priority": false
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

