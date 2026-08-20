const heroLiveData = {

    rating: "4.9",

    stars: "★★★★★",

    items: [

        {
            icon: "🔥",
            text: "12 Enquiries Today",
            color: "orange"
        },

        {
            icon: "🚖",
            text: "5 Vehicles Available",
            color: "green"
        },

        {
            icon: "🏖",
            text: "3 Holiday Offers",
            color: "purple"
        },

        {
            icon: "✈",
            text: "8 Flight Deals Today",
            color: "blue"
        },

        {
            icon: "🚆",
            text: "4 Train Offers",
            color: "teal"
        },

        {
            icon: "💬",
            text: "24×7 Travel Support",
            color: "pink"
        },

        {
            icon: "🎁",
            text: "2 Special Discounts",
            color: "gold"
        },

        {
            icon: "🌍",
            text: "International Packages",
            color: "indigo"
        }

    ],

    trustBar: [

        {
            icon: "🛡",
            text: "Trusted Travel Partner",
            color: "blue"
        },

        {
            icon: "⚡",
            text: "Instant Ticket Confirmation",
            color: "orange"
        },

        {
            icon: "🚖",
            text: "Premium Fleet Available",
            color: "green"
        },

        {
            icon: "💬",
            text: "Real Human Support",
            color: "teal"
        },

        {
            icon: "🏖",
            text: "Curated Holiday Packages",
            color: "purple"
        }

    ],

    greetings: [

        {

            days: [1, 2, 3, 4],

            times: ["morning"],

            icon: "🌞",

            title: "Good Morning!",

            message: "Start your day with your next adventure."

        },

        {

            days: [1, 2, 3, 4],

            times: ["afternoon"],

            icon: "☀",

            title: "Good Afternoon!",

            message: "Today's best travel deals are live."

        },

        {

            days: [1, 2, 3, 4],

            times: ["evening"],

            icon: "🌆",

            title: "Good Evening!",

            message: "Weekend escapes are waiting."

        },

        {

            days: [1, 2, 3, 4],

            times: ["night"],

            icon: "🌙",

            title: "Good Evening!",

            message: "Tomorrow's adventure starts today."

        },

        {

            days: [5],

            times: ["all"],

            icon: "🎉",

            title: "Happy Friday!",

            message: "Weekend escapes are waiting."

        },

        {

            days: [6],

            times: ["all"],

            icon: "🏖",

            title: "Happy Weekend!",

            message: "Perfect day to plan a getaway."

        },

        {

            days: [0],

            times: ["all"],

            icon: "🌴",

            title: "Happy Sunday!",

            message: "Relax and discover your next journey."

        }

    ],


    specialEvents: [

        {

            enabled: true,

            priority: 3,

            startMonth: 12,
            startDay: 27,

            endMonth: 1,
            endDay: 4,

            icon: "🎆",

            title: "Happy New Year!",

            message: "Begin the year with unforgettable travel experiences.",

            badge: "NEW YEAR ESCAPE",

            theme: "newyear",

            primaryColor: "#1565c0",

            secondaryColor: "#7b1fa2",

            accentColor: "#ffd700",

            textColor: "#ffffff",

            overlay: "rgba(0,0,0,.40)",

            offer: "🎁 Dubai • Maldives • Singapore Deals",

            cta: "Explore New Year Holidays",

            subtitle: "Limited Time Offers",

            pill: "🎆",

            liveTicker: [

                {
                    icon: "🎆",
                    text: "New Year Holiday Deals Live",
                    color: "orange"
                },

                {
                    icon: "✈",
                    text: "Dubai New Year Packages Filling Fast",
                    color: "blue"
                },

                {
                    icon: "🏖",
                    text: "Goa Beach Celebrations Available",
                    color: "green"
                }

            ],

            urgency: [
                "🔥 Limited Time New Year Sale",
                "✈ International Packages Filling Fast",
                "🎁 Exclusive Cashback Available",
                "🏖 Holiday Deals Ending Soon"
            ],

            countdown: true,

            expiryHour: 23,

            expiryMinute: 59,

            countdownText: "🎁 Offer Ends In",

            urgencyColor: "#ff5722",

            progressColor: "#ffd700",

            progressBg: "rgba(255,255,255,.25)",

            countdownColor: "#ffffff",

            countdownBg: "rgba(0,0,0,.30)",


            typingTexts: [

                "🎆 New Year Holiday Deals",

                "✈ Dubai Celebration Packages",

                "🏖 Maldives Escapes",

                "🎁 Cashback Offers",

                "🌏 Start Your Journey Today"

            ],

            heroImage:
                "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=2000&q=80"
        },

        {
            enabled: true,

            priority: 3,

            startMonth: 1,
            startDay: 13,

            endMonth: 1,
            endDay: 18,

            icon: "🌾",

            title: "Happy Pongal!",

            message: "Celebrate the harvest season with memorable family trips.",

            badge: "PONGAL SPECIAL",

            theme: "pongal",

            primaryColor: "#d35400",

            secondaryColor: "#f39c12",

            accentColor: "#ffd54f",

            textColor: "#ffffff",

            overlay: "rgba(0,0,0,.40)",

            offer: "🌾 Tamil Nadu • Kerala • Coorg Holiday Deals",

            cta: "Explore Pongal Packages",

            subtitle: "Harvest Festival Offers",

            pill: "🌾",

            liveTicker: [

                {
                    icon: "🌾",
                    text: "Pongal Holiday Packages Live",
                    color: "orange"
                },

                {
                    icon: "🚗",
                    text: "South India Family Tours Available",
                    color: "green"
                },

                {
                    icon: "🏖",
                    text: "Weekend Getaway Discounts",
                    color: "blue"
                }

            ],

            urgency: [

                "🔥 Pongal Holiday Sale",

                "🌾 Family Packages Selling Fast",

                "🚗 South India Tours Available",

                "🎁 Cashback Offers Live"

            ],

            countdown: true,

            expiryHour: 23,

            expiryMinute: 59,

            countdownText: "🌾 Offer Ends In",

            urgencyColor: "#ff9800",

            progressColor: "#ffd54f",

            progressBg: "rgba(255,255,255,.25)",

            countdownColor: "#ffffff",

            countdownBg: "rgba(0,0,0,.30)",

            typingTexts: [

                "🌾 Pongal Holiday Deals",

                "🚗 South India Road Trips",

                "🏞 Kerala Escapes",

                "🎁 Family Discounts",

                "✈ Travel This Harvest Season"

            ],

            heroImage:
                "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2000&q=80"
        },

        {
            enabled: true,

            priority: 3,

            startMonth: 1,
            startDay: 24,

            endMonth: 1,
            endDay: 28,

            icon: "🇮🇳",

            title: "Happy Republic Day!",

            message: "Celebrate Incredible India with patriotic travel experiences.",

            badge: "REPUBLIC DAY SALE",

            theme: "republic",

            primaryColor: "#ff9933",

            secondaryColor: "#138808",

            accentColor: "#ffffff",

            textColor: "#ffffff",

            overlay: "rgba(0,0,0,.45)",

            offer: "🇮🇳 Kashmir • Rajasthan • North East Deals",

            cta: "Explore India",

            subtitle: "Proudly Indian",

            pill: "🇮🇳",

            liveTicker: [

                {
                    icon: "🇮🇳",
                    text: "Republic Day Travel Sale Live",
                    color: "orange"
                },

                {
                    icon: "✈",
                    text: "Domestic Flight Offers Available",
                    color: "green"
                },

                {
                    icon: "🏔",
                    text: "Explore Incredible India",
                    color: "blue"
                }

            ],

            urgency: [

                "🔥 Republic Day Discounts",

                "🇮🇳 Domestic Tours Filling Fast",

                "✈ Flight Deals Available",

                "🎁 Limited Period Offers"

            ],

            countdown: true,

            expiryHour: 23,

            expiryMinute: 59,

            countdownText: "🇮🇳 Sale Ends In",

            urgencyColor: "#ff5722",

            progressColor: "#ff9933",

            progressBg: "rgba(255,255,255,.25)",

            countdownColor: "#ffffff",

            countdownBg: "rgba(0,0,0,.30)",

            typingTexts: [

                "🇮🇳 Explore Incredible India",

                "🏔 Kashmir Adventures",

                "🏜 Rajasthan Heritage Tours",

                "✈ Domestic Flight Discounts",

                "🎁 Republic Day Specials"

            ],

            heroImage:
                "https://images.unsplash.com/photo-1524492449090-1abe1e3f3b8f?auto=format&fit=crop&w=2000&q=80"
        },

        {
            enabled: true,
            priority: 3,

            startMonth: 2,
            startDay: 12,

            endMonth: 2,
            endDay: 16,

            icon: "❤️",

            title: "Happy Valentine's Day!",

            message: "Create unforgettable memories together.",

            badge: "ROMANTIC ESCAPES",

            theme: "valentine",

            primaryColor: "#e91e63",
            secondaryColor: "#ad1457",
            accentColor: "#ffd1dc",
            textColor: "#ffffff",
            overlay: "rgba(0,0,0,.35)",

            offer: "❤️ Maldives • Bali • Goa Couple Deals",

            cta: "Plan Romantic Escape",

            subtitle: "Couple Specials",

            pill: "❤️",

            liveTicker: [
                {
                    icon: "❤️",
                    text: "Couple Packages Live",
                    color: "red"
                },
                {
                    icon: "🏖",
                    text: "Maldives Trending",
                    color: "blue"
                },
                {
                    icon: "✈",
                    text: "Bali Honeymoon Deals",
                    color: "green"
                }
            ],

            urgency: [
                "❤️ Romantic Deals Live",
                "🏖 Beach Resorts Selling Fast",
                "🎁 Cashback Available",
                "🔥 Couple Offers Ending Soon"
            ],

            countdown: true,

            expiryHour: 23,
            expiryMinute: 59,

            countdownText: "❤️ Offer Ends In",

            urgencyColor: "#e91e63",

            progressColor: "#ff80ab",

            progressBg: "rgba(255,255,255,.25)",

            countdownColor: "#ffffff",

            countdownBg: "rgba(0,0,0,.30)",

            typingTexts: [
                "❤️ Romantic Getaways",
                "🏖 Maldives Escapes",
                "✈ Bali Honeymoons",
                "🌹 Couple Holiday Deals",
                "🎁 Valentine's Cashback"
            ],

            heroImage:
                "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=2000&q=80"
        },

        {
            enabled: true,
            priority: 3,

            startMonth: 3,
            startDay: 1,

            endMonth: 3,
            endDay: 5,

            icon: "🕉️",

            title: "Happy Maha Shivaratri!",

            message: "Embark on a divine spiritual journey.",

            badge: "SPIRITUAL TOURS",

            theme: "shivaratri",

            primaryColor: "#283593",
            secondaryColor: "#5e35b1",
            accentColor: "#90caf9",
            textColor: "#ffffff",
            overlay: "rgba(0,0,0,.40)",

            offer: "🕉️ Kashi • Kedarnath • Rameswaram Tours",

            cta: "Explore Pilgrimage",

            subtitle: "Sacred Destinations",

            pill: "🕉️",

            liveTicker: [
                {
                    icon: "🕉️",
                    text: "Pilgrimage Packages Live",
                    color: "blue"
                },
                {
                    icon: "🚩",
                    text: "Kashi Tours Available",
                    color: "orange"
                },
                {
                    icon: "🏔",
                    text: "Kedarnath Bookings Open",
                    color: "green"
                }
            ],

            urgency: [
                "🕉️ Spiritual Journeys Live",
                "🚩 Temple Tours Filling Fast",
                "🎁 Pilgrimage Discounts",
                "🔥 Limited Departures"
            ],

            countdown: true,

            expiryHour: 23,
            expiryMinute: 59,

            countdownText: "🕉️ Offer Ends In",

            urgencyColor: "#3f51b5",

            progressColor: "#64b5f6",

            progressBg: "rgba(255,255,255,.25)",

            countdownColor: "#ffffff",

            countdownBg: "rgba(0,0,0,.30)",

            typingTexts: [
                "🕉️ Divine Pilgrimages",
                "🚩 Kashi Temple Tours",
                "🏔 Kedarnath Adventures",
                "🙏 Sacred India",
                "✈ Spiritual Travel Deals"
            ],

            heroImage:
                "https://images.unsplash.com/photo-1512632578888-169bbbc64f33?auto=format&fit=crop&w=2000&q=80"
        },

        {
            enabled: true,
            priority: 3,

            startMonth: 3,
            startDay: 15,

            endMonth: 3,
            endDay: 20,

            icon: "🌈",

            title: "Happy Holi!",

            message: "Celebrate colors with joyful travel experiences.",

            badge: "HOLI FESTIVAL SALE",

            theme: "holi",

            primaryColor: "#ff5722",
            secondaryColor: "#8e24aa",
            accentColor: "#ffeb3b",
            textColor: "#ffffff",
            overlay: "rgba(0,0,0,.30)",

            offer: "🌈 Mathura • Vrindavan • Jaipur Tours",

            cta: "Celebrate Holi",

            subtitle: "Festival Travel",

            pill: "🌈",

            liveTicker: [
                {
                    icon: "🌈",
                    text: "Holi Packages Live",
                    color: "orange"
                },
                {
                    icon: "🎨",
                    text: "Mathura Celebrations Trending",
                    color: "blue"
                },
                {
                    icon: "🏰",
                    text: "Jaipur Tours Available",
                    color: "green"
                }
            ],

            urgency: [
                "🌈 Holi Festival Sale",
                "🎨 Color Festival Tours",
                "🎁 Cashback Offers",
                "🔥 Limited Seats Left"
            ],

            countdown: true,

            expiryHour: 23,
            expiryMinute: 59,

            countdownText: "🌈 Offer Ends In",

            urgencyColor: "#ff5722",

            progressColor: "#ffeb3b",

            progressBg: "rgba(255,255,255,.25)",

            countdownColor: "#ffffff",

            countdownBg: "rgba(0,0,0,.30)",

            typingTexts: [
                "🌈 Celebrate Holi",
                "🎨 Mathura Festival",
                "🏰 Jaipur Heritage",
                "✈ Festival Escapes",
                "🎁 Special Holiday Deals"
            ],

            heroImage:
                "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=2000&q=80"
        },


        {
            enabled: true,
            priority: 3,

            startMonth: 3,
            startDay: 25,

            endMonth: 3,
            endDay: 28,

            icon: "🌙",

            title: "Ramadan Mubarak!",

            message: "Travel with blessings and togetherness.",

            badge: "RAMADAN SPECIAL",

            theme: "ramadan",

            primaryColor: "#00695c",
            secondaryColor: "#00897b",
            accentColor: "#ffd54f",
            textColor: "#ffffff",
            overlay: "rgba(0,0,0,.45)",

            offer: "🕌 Umrah • Dubai • Family Packages",

            cta: "Explore Ramadan Deals",

            subtitle: "Blessed Journey",

            pill: "🌙",

            liveTicker: [
                { icon: "🌙", text: "Ramadan Travel Offers Live", color: "green" },
                { icon: "✈", text: "Umrah Bookings Open", color: "blue" },
                { icon: "🕌", text: "Middle East Packages Available", color: "orange" }
            ],

            urgency: [
                "🌙 Limited Ramadan Packages",
                "✈ Family Travel Offers",
                "🕌 Umrah Seats Filling Fast",
                "🎁 Special Holiday Savings"
            ],

            countdown: true,
            expiryHour: 23,
            expiryMinute: 59,

            countdownText: "🌙 Offer Ends In",

            urgencyColor: "#ff9800",
            progressColor: "#ffd54f",
            progressBg: "rgba(255,255,255,.25)",
            countdownColor: "#fff",
            countdownBg: "rgba(0,0,0,.30)",

            typingTexts: [
                "🌙 Ramadan Mubarak",
                "🕌 Umrah Packages",
                "✈ Dubai Family Holidays",
                "🎁 Blessed Travel Deals",
                "🌍 Travel With Peace"
            ],

            heroImage:
                "https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=2000&q=80"
        },

        {
            enabled: true,
            priority: 3,

            startMonth: 4,
            startDay: 2,

            endMonth: 4,
            endDay: 5,

            icon: "🌸",

            title: "Happy Ugadi!",

            message: "Celebrate the New Year with new journeys.",

            badge: "UGADI SPECIAL",

            theme: "ugadi",

            primaryColor: "#388e3c",
            secondaryColor: "#8bc34a",
            accentColor: "#ffd54f",
            textColor: "#fff",
            overlay: "rgba(0,0,0,.40)",

            offer: "🎁 South India Holiday Packages",

            cta: "Explore Ugadi Deals",

            subtitle: "New Year Savings",

            pill: "🌸",

            liveTicker: [
                { icon: "🌸", text: "Ugadi Packages Live", color: "green" },
                { icon: "🏝", text: "Kerala Tours Available", color: "orange" },
                { icon: "🚗", text: "Family Holidays Open", color: "blue" }
            ],

            urgency: [
                "🌸 Ugadi Family Deals",
                "🚗 South India Tours",
                "🎁 Festival Cashback",
                "🏝 Holiday Offers"
            ],

            countdown: true,
            expiryHour: 23,
            expiryMinute: 59,

            countdownText: "🌸 Offer Ends In",

            urgencyColor: "#4caf50",
            progressColor: "#ffd54f",
            progressBg: "rgba(255,255,255,.25)",
            countdownColor: "#fff",
            countdownBg: "rgba(0,0,0,.30)",

            typingTexts: [
                "🌸 Happy Ugadi",
                "🏝 Kerala Packages",
                "🚗 Family Holidays",
                "🎁 Festival Savings",
                "🌍 New Year Adventures"
            ],

            heroImage:
                "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=2000&q=80"
        },

        {
            enabled: true,
            priority: 3,

            startMonth: 4,
            startDay: 14,

            endMonth: 4,
            endDay: 15,

            icon: "🌞",

            title: "Happy Tamil New Year!",

            message: "Puthandu Vazthukal!",

            badge: "TAMIL NEW YEAR",

            theme: "tamil",

            primaryColor: "#8e24aa",
            secondaryColor: "#ec407a",
            accentColor: "#ffd54f",
            textColor: "#fff",
            overlay: "rgba(0,0,0,.40)",

            offer: "🏖 Tamil Nadu Heritage Tours",

            cta: "Celebrate Puthandu",

            subtitle: "Special Festival Offers",

            pill: "🌞",

            liveTicker: [
                { icon: "🌞", text: "Tamil New Year Packages", color: "orange" },
                { icon: "🏝", text: "Temple Tours Available", color: "green" },
                { icon: "🚗", text: "Weekend Holidays Open", color: "blue" }
            ],

            urgency: [
                "🌞 Festival Travel Deals",
                "🏝 Heritage Tours",
                "🚗 Family Holidays",
                "🎁 Cashback Offers"
            ],

            countdown: true,
            expiryHour: 23,
            expiryMinute: 59,

            countdownText: "🌞 Offer Ends In",

            urgencyColor: "#ff9800",
            progressColor: "#ffd54f",
            progressBg: "rgba(255,255,255,.25)",
            countdownColor: "#fff",
            countdownBg: "rgba(0,0,0,.30)",

            typingTexts: [
                "🌞 Happy Puthandu",
                "🏝 Heritage Tours",
                "🚗 Family Holidays",
                "🎁 Festival Offers",
                "🌍 Explore Tamil Nadu"
            ],

            heroImage:
                "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=2000&q=80"
        },

        {
            enabled: true,
            priority: 3,

            startMonth: 4,
            startDay: 15,

            endMonth: 4,
            endDay: 22,

            icon: "🪔",
            title: "Happy Vishu!",
            message: "Celebrate prosperity and new beginnings.",
            badge: "VISHU SPECIAL",
            theme: "vishu",
            primaryColor: "#2e7d32",
            secondaryColor: "#66bb6a",
            accentColor: "#ffd54f",
            textColor: "#fff",
            overlay: "rgba(0,0,0,.40)",
            offer: "🌴 Kerala Holiday Specials",
            cta: "Explore Kerala",
            subtitle: "Vishu Festival Deals",
            pill: "🪔",

            liveTicker: [
                { icon: "🪔", text: "Kerala Packages Live", color: "green" },
                { icon: "🌴", text: "Backwater Tours Available", color: "blue" },
                { icon: "🚗", text: "Family Trips Open", color: "orange" }
            ],

            urgency: [
                "🪔 Vishu Festival Offers",
                "🌴 Kerala Holidays",
                "🚗 Family Packages",
                "🎁 Cashback Deals"
            ],

            countdown: true,
            expiryHour: 23,
            expiryMinute: 59,
            countdownText: "🪔 Offer Ends In",

            urgencyColor: "#4caf50",
            progressColor: "#ffd54f",
            progressBg: "rgba(255,255,255,.25)",
            countdownColor: "#fff",
            countdownBg: "rgba(0,0,0,.30)",

            typingTexts: [
                "🪔 Happy Vishu",
                "🌴 Kerala Packages",
                "🚗 Family Trips",
                "🎁 Holiday Savings",
                "🌍 Explore God's Own Country"
            ],

            heroImage:
                "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=2000&q=80"
        },


        {
            enabled: true,
            priority: 3,

            startMonth: 4,
            startDay: 18,

            endMonth: 4,
            endDay: 20,

            icon: "✝️",

            title: "Happy Easter!",

            message: "Celebrate hope, faith and memorable family journeys.",

            badge: "EASTER SPECIAL",

            theme: "easter",

            primaryColor: "#5e35b1",
            secondaryColor: "#42a5f5",
            accentColor: "#ffd54f",
            textColor: "#ffffff",
            overlay: "rgba(0,0,0,.40)",

            offer: "🐰 Goa • Kerala • Family Holiday Deals",

            cta: "Explore Easter Holidays",

            subtitle: "Family Vacation Offers",

            pill: "🐰",

            liveTicker: [
                { icon: "✝️", text: "Easter Holiday Deals Live", color: "purple" },
                { icon: "🏖", text: "Goa Packages Available", color: "green" },
                { icon: "✈", text: "Weekend Flights Open", color: "blue" }
            ],

            urgency: [
                "🐰 Easter Deals Ending Soon",
                "✈ Family Holidays Filling Fast",
                "🏖 Premium Resorts Available",
                "🎁 Cashback Offers Live"
            ],

            countdown: true,
            expiryHour: 23,
            expiryMinute: 59,

            countdownText: "🐰 Offer Ends In",

            urgencyColor: "#ff9800",
            progressColor: "#ffd54f",
            progressBg: "rgba(255,255,255,.25)",
            countdownColor: "#fff",
            countdownBg: "rgba(0,0,0,.30)",

            typingTexts: [
                "✝️ Happy Easter",
                "🏖 Goa Holiday Packages",
                "✈ Weekend Escapes",
                "🎁 Family Travel Deals",
                "🌍 Travel Together"
            ],

            heroImage:
                "https://images.unsplash.com/photo-1507692049790-de58290a4334?auto=format&fit=crop&w=2000&q=80"
        },

        {
            enabled: true,
            priority: 2,

            startMonth: 4,
            startDay: 20,

            endMonth: 6,
            endDay: 29,

            icon: "☀️",

            title: "Summer Vacation Special!",

            message: "Escape to cool hills and tropical beaches.",

            badge: "SUMMER HOLIDAYS",

            theme: "summer",

            primaryColor: "#ff9800",
            secondaryColor: "#ff5722",
            accentColor: "#ffd54f",
            textColor: "#fff",
            overlay: "rgba(0,0,0,.35)",

            offer: "🏖 Ooty • Manali • Kashmir • Bali",

            cta: "Explore Summer Tours",

            subtitle: "Peak Season Deals",

            pill: "☀️",

            liveTicker: [
                { icon: "☀️", text: "Summer Deals Live", color: "orange" },
                { icon: "🏔", text: "Hill Station Packages", color: "green" },
                { icon: "🏖", text: "Beach Holidays Available", color: "blue" }
            ],

            urgency: [
                "☀️ Summer Bookings Open",
                "🏔 Hill Stations Filling Fast",
                "🏖 Beach Resorts Selling Quickly",
                "🎁 Early Bird Discounts"
            ],

            countdown: true,
            expiryHour: 23,
            expiryMinute: 59,

            countdownText: "☀️ Summer Sale Ends In",

            urgencyColor: "#ff5722",
            progressColor: "#ffd54f",
            progressBg: "rgba(255,255,255,.25)",
            countdownColor: "#fff",
            countdownBg: "rgba(0,0,0,.30)",

            typingTexts: [
                "☀️ Summer Holidays",
                "🏔 Ooty Packages",
                "🏖 Bali Escapes",
                "✈ Kashmir Adventures",
                "🎁 Family Vacation Deals"
            ],

            heroImage:
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80"
        },

        {
            enabled: true,
            priority: 2,

            startMonth: 8,
            startDay: 1,

            endMonth: 8,
            endDay: 4,

            icon: "🤝",

            title: "Happy Friendship Day!",

            message: "Create unforgettable memories with your friends.",

            badge: "FRIENDSHIP SPECIAL",

            theme: "friendship",

            primaryColor: "#2196f3",
            secondaryColor: "#9c27b0",
            accentColor: "#ffd54f",
            textColor: "#fff",
            overlay: "rgba(0,0,0,.40)",

            offer: "🏖 Group Tours & Road Trips",

            cta: "Plan A Friends Trip",

            subtitle: "Group Discounts",

            pill: "🤝",

            liveTicker: [
                { icon: "🤝", text: "Friends Group Tours Live", color: "blue" },
                { icon: "🚗", text: "Road Trips Available", color: "green" },
                { icon: "🏖", text: "Beach Holidays Trending", color: "orange" }
            ],

            urgency: [
                "🤝 Group Discounts Live",
                "🚗 Weekend Trips Filling",
                "🏖 Beach Packages Available",
                "🎁 Cashback Offers"
            ],

            countdown: true,
            expiryHour: 23,
            expiryMinute: 59,

            countdownText: "🤝 Offer Ends In",

            urgencyColor: "#ff5722",
            progressColor: "#ffd54f",
            progressBg: "rgba(255,255,255,.25)",
            countdownColor: "#fff",
            countdownBg: "rgba(0,0,0,.30)",

            typingTexts: [
                "🤝 Friendship Day Trips",
                "🚗 Road Adventures",
                "🏖 Beach Getaways",
                "✈ Group Travel",
                "🎁 Travel With Friends"
            ],

            heroImage:
                "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=2000&q=80"
        },

        {
            enabled: true,
            priority: 3,

            startMonth: 8,
            startDay: 13,

            endMonth: 8,
            endDay: 17,

            icon: "🇮🇳",

            title: "Happy Independence Day!",

            message: "Celebrate India's freedom through unforgettable journeys.",

            badge: "FREEDOM SALE",

            theme: "independence",

            primaryColor: "#ff9933",
            secondaryColor: "#138808",
            accentColor: "#ffffff",
            textColor: "#fff",
            overlay: "rgba(0,0,0,.40)",

            offer: "🇮🇳 Kashmir • Leh • Andaman • Northeast",

            cta: "Explore India",

            subtitle: "Freedom Travel Deals",

            pill: "🇮🇳",

            liveTicker: [
                { icon: "🇮🇳", text: "Freedom Sale Live", color: "orange" },
                { icon: "✈", text: "Domestic Flights Trending", color: "blue" },
                { icon: "🏔", text: "Leh & Kashmir Popular", color: "green" }
            ],

            urgency: [
                "🇮🇳 Freedom Sale Live",
                "✈ Flights Selling Fast",
                "🏔 Himalayan Packages Available",
                "🎁 Special Cashback"
            ],

            countdown: true,
            expiryHour: 23,
            expiryMinute: 59,

            countdownText: "🇮🇳 Freedom Sale Ends In",

            urgencyColor: "#ff5722",
            progressColor: "#ffffff",
            progressBg: "rgba(255,255,255,.25)",
            countdownColor: "#fff",
            countdownBg: "rgba(0,0,0,.30)",

            typingTexts: [
                "🇮🇳 Happy Independence Day",
                "🏔 Explore Kashmir",
                "✈ Fly Across India",
                "🎁 Freedom Sale",
                "🌍 Incredible India Awaits"
            ],

            heroImage:
                "https://images.unsplash.com/photo-1524492449090-1abe1e3f3b8f?auto=format&fit=crop&w=2000&q=80"
        },

        {
            enabled: true,
            priority: 3,

            startMonth: 8,
            startDay: 24,

            endMonth: 8,
            endDay: 30,

            icon: "🎀",

            title: "Happy Raksha Bandhan!",

            message: "Celebrate the bond of love with memorable family journeys.",

            badge: "RAKSHA BANDHAN SPECIAL",

            theme: "rakhi",

            primaryColor: "#e91e63",
            secondaryColor: "#ff9800",
            accentColor: "#ffd54f",
            textColor: "#ffffff",
            overlay: "rgba(0,0,0,.35)",

            offer: "🏔 Family Holidays & Special Gifts",

            cta: "Plan Family Trip",

            subtitle: "Celebrate Together",

            pill: "🎀",

            liveTicker: [
                { icon: "🎀", text: "Rakhi Family Deals Live", color: "orange" },
                { icon: "🏔", text: "Hill Station Packages", color: "green" },
                { icon: "🎁", text: "Gift Travel Vouchers", color: "blue" }
            ],

            urgency: [
                "🎀 Family Deals Live",
                "🏔 Weekend Escapes Filling",
                "🎁 Travel Gift Cards Available",
                "✈ Book Family Holidays"
            ],

            countdown: true,
            expiryHour: 23,
            expiryMinute: 59,

            countdownText: "🎀 Offer Ends In",

            urgencyColor: "#ff5722",
            progressColor: "#ffd54f",
            progressBg: "rgba(255,255,255,.25)",
            countdownColor: "#fff",
            countdownBg: "rgba(0,0,0,.30)",

            typingTexts: [
                "🎀 Happy Raksha Bandhan",
                "🏔 Family Holiday Packages",
                "🎁 Travel Gift Cards",
                "✈ Weekend Escapes",
                "❤️ Celebrate Together"
            ],

            heroImage:
                "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=2000&q=80"
        },

        {
            enabled: true,
            priority: 3,

            startMonth: 9,
            startDay: 1,

            endMonth: 9,
            endDay: 5,

            icon: "🦚",

            title: "Happy Janmashtami!",

            message: "Experience the divine journey of Lord Krishna.",

            badge: "JANMASHTAMI SPECIAL",

            theme: "krishna",

            primaryColor: "#1a237e",
            secondaryColor: "#3949ab",
            accentColor: "#ffd54f",
            textColor: "#fff",
            overlay: "rgba(0,0,0,.40)",

            offer: "🛕 Mathura • Vrindavan Pilgrimage",

            cta: "Explore Spiritual Tours",

            subtitle: "Sacred Journeys",

            pill: "🦚",

            liveTicker: [
                { icon: "🦚", text: "Janmashtami Tours Live", color: "blue" },
                { icon: "🛕", text: "Vrindavan Packages", color: "green" },
                { icon: "✈", text: "Pilgrimage Flights Open", color: "orange" }
            ],

            urgency: [
                "🦚 Spiritual Tours Available",
                "🛕 Temple Visits Trending",
                "✈ Pilgrimage Packages Filling",
                "🎁 Festival Discounts"
            ],

            countdown: true,
            expiryHour: 23,
            expiryMinute: 59,

            countdownText: "🦚 Offer Ends In",

            urgencyColor: "#ff9800",
            progressColor: "#ffd54f",
            progressBg: "rgba(255,255,255,.25)",
            countdownColor: "#fff",
            countdownBg: "rgba(0,0,0,.30)",

            typingTexts: [
                "🦚 Happy Janmashtami",
                "🛕 Mathura Tours",
                "✈ Spiritual Journeys",
                "🎁 Festival Discounts",
                "🌍 Travel With Blessings"
            ],

            heroImage:
                "https://images.unsplash.com/photo-1512632578888-169bbbc64f33?auto=format&fit=crop&w=2000&q=80"
        },

        {
            enabled: true,
            priority: 3,

            startMonth: 9,
            startDay: 11,

            endMonth: 9,
            endDay: 19,

            icon: "🐘",

            title: "Happy Ganesh Chaturthi!",

            message: "Seek Lord Ganesha's blessings through sacred journeys.",

            badge: "GANESH SPECIAL",

            theme: "ganesh",

            primaryColor: "#ef6c00",
            secondaryColor: "#d84315",
            accentColor: "#ffd54f",
            textColor: "#fff",
            overlay: "rgba(0,0,0,.35)",

            offer: "🛕 Mumbai • Pune Festival Tours",

            cta: "Explore Ganesh Tours",

            subtitle: "Festival Packages",

            pill: "🐘",

            liveTicker: [
                { icon: "🐘", text: "Ganesh Festival Tours", color: "orange" },
                { icon: "🛕", text: "Mumbai Packages", color: "blue" },
                { icon: "🎁", text: "Festival Discounts", color: "green" }
            ],

            urgency: [
                "🐘 Ganesh Tours Live",
                "🛕 Temple Visits Available",
                "🎁 Cashback Offers",
                "✈ Festival Travel Filling"
            ],

            countdown: true,
            expiryHour: 23,
            expiryMinute: 59,

            countdownText: "🐘 Offer Ends In",

            urgencyColor: "#ff5722",
            progressColor: "#ffd54f",
            progressBg: "rgba(255,255,255,.25)",
            countdownColor: "#fff",
            countdownBg: "rgba(0,0,0,.30)",

            typingTexts: [
                "🐘 Happy Ganesh Chaturthi",
                "🛕 Mumbai Festival Tours",
                "✈ Sacred Journeys",
                "🎁 Festival Offers",
                "🙏 Travel With Blessings"
            ],

            heroImage:
                "https://images.unsplash.com/photo-1599661046827-dacde6976542?auto=format&fit=crop&w=2000&q=80"
        },

        {
            enabled: true,

            priority: 3,

            startMonth: 10,
            startDay: 11,

            endMonth: 10,
            endDay: 19,

            icon: "🌸",

            title: "Happy Navratri!",

            message: "Celebrate nine nights of devotion with unforgettable journeys.",

            badge: "NAVRATRI SPECIAL",

            theme: "navratri",

            primaryColor: "#8e24aa",

            secondaryColor: "#ec407a",

            accentColor: "#ffd54f",

            textColor: "#ffffff",

            overlay: "rgba(0,0,0,.35)",

            offer: "💃 Gujarat Garba • Mata Temple Tours",

            cta: "Explore Navratri Packages",

            subtitle: "Nine Nights Celebration",

            pill: "🌸",

            liveTicker: [

                {
                    icon: "🌸",
                    text: "Navratri Festival Deals Live",
                    color: "purple"
                },

                {
                    icon: "💃",
                    text: "Garba Festival Packages Trending",
                    color: "orange"
                },

                {
                    icon: "🛕",
                    text: "Mata Temple Tours Available",
                    color: "green"
                }

            ],

            urgency: [

                "🌸 Navratri Deals Live",

                "💃 Garba Packages Filling Fast",

                "🛕 Temple Tours Trending",

                "🎁 Festival Discounts Available"

            ],

            countdown: true,

            expiryHour: 23,

            expiryMinute: 59,

            countdownText: "🌸 Offer Ends In",

            urgencyColor: "#ff5722",

            progressColor: "#ffd54f",

            progressBg: "rgba(255,255,255,.25)",

            countdownColor: "#ffffff",

            countdownBg: "rgba(0,0,0,.30)",

            typingTexts: [

                "🌸 Happy Navratri",

                "💃 Gujarat Garba Packages",

                "🛕 Divine Temple Tours",

                "🎁 Festival Cashback",

                "✈ Celebrate With Family"

            ],

            heroImage:
                "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=2000&q=80"

        },

        {
            enabled: true,

            priority: 3,

            startMonth: 10,
            startDay: 18,

            endMonth: 10,
            endDay: 21,

            icon: "🏹",

            title: "Happy Dussehra!",

            message: "Celebrate the victory of good over evil with memorable journeys.",

            badge: "DUSSEHRA SPECIAL",

            theme: "dussehra",

            primaryColor: "#d84315",

            secondaryColor: "#ff9800",

            accentColor: "#ffd54f",

            textColor: "#ffffff",

            overlay: "rgba(0,0,0,.35)",

            offer: "🏰 Mysore • Kullu • Heritage Tours",

            cta: "Explore Dussehra Holidays",

            subtitle: "Festival Travel Sale",

            pill: "🏹",

            liveTicker: [

                {
                    icon: "🏹",
                    text: "Dussehra Holiday Deals Live",
                    color: "orange"
                },

                {
                    icon: "🏰",
                    text: "Mysore Festival Tours Trending",
                    color: "blue"
                },

                {
                    icon: "✈",
                    text: "Heritage Packages Available",
                    color: "green"
                }

            ],

            urgency: [

                "🏹 Dussehra Offers Live",

                "🏰 Heritage Tours Filling",

                "✈ Holiday Packages Trending",

                "🎁 Festival Cashback"

            ],

            countdown: true,

            expiryHour: 23,

            expiryMinute: 59,

            countdownText: "🏹 Offer Ends In",

            urgencyColor: "#ff5722",

            progressColor: "#ffd54f",

            progressBg: "rgba(255,255,255,.25)",

            countdownColor: "#ffffff",

            countdownBg: "rgba(0,0,0,.30)",

            typingTexts: [

                "🏹 Happy Dussehra",

                "🏰 Heritage Holidays",

                "✈ Festival Escapes",

                "🎁 Exclusive Offers",

                "🌍 Travel With Family"

            ],

            heroImage:
                "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=2000&q=80"

        },

        {
            enabled: true,

            priority: 4,

            startMonth: 11,
            startDay: 5,

            endMonth: 11,
            endDay: 10,

            icon: "🪔",

            title: "Happy Diwali!",

            message: "Light up your holidays with unforgettable travel experiences.",

            badge: "DIWALI MEGA SALE",

            theme: "diwali",

            primaryColor: "#ef6c00",

            secondaryColor: "#fb8c00",

            accentColor: "#ffd54f",

            textColor: "#ffffff",

            overlay: "rgba(0,0,0,.35)",

            offer: "🪔 Jaipur • Ayodhya • Varanasi Tours",

            cta: "Explore Diwali Holidays",

            subtitle: "Festival Mega Sale",

            pill: "🪔",

            liveTicker: [

                {
                    icon: "🪔",
                    text: "Diwali Mega Sale Live",
                    color: "orange"
                },

                {
                    icon: "🏰",
                    text: "Royal Rajasthan Packages",
                    color: "purple"
                },

                {
                    icon: "🎁",
                    text: "Festival Cashback Available",
                    color: "green"
                }

            ],

            urgency: [

                "🪔 Diwali Sale Live",

                "🎁 Cashback Offers Available",

                "✈ Holiday Packages Filling",

                "🏰 Luxury Tours Trending"

            ],

            countdown: true,

            expiryHour: 23,

            expiryMinute: 59,

            countdownText: "🪔 Offer Ends In",

            urgencyColor: "#ff5722",

            progressColor: "#ffd54f",

            progressBg: "rgba(255,255,255,.25)",

            countdownColor: "#ffffff",

            countdownBg: "rgba(0,0,0,.30)",

            typingTexts: [

                "🪔 Happy Diwali",

                "🎁 Festival Cashback",

                "🏰 Rajasthan Luxury Tours",

                "✈ Holiday Packages",

                "🌍 Celebrate With Family"

            ],

            heroImage:
                "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?auto=format&fit=crop&w=2000&q=80"

        },

        {
            enabled: true,

            priority: 3,

            startMonth: 11,
            startDay: 22,

            endMonth: 11,
            endDay: 26,

            icon: "🎄",

            title: "Merry Christmas!",

            message: "Celebrate the festive season with magical travel experiences.",

            badge: "CHRISTMAS SPECIAL",

            theme: "christmas",

            primaryColor: "#2e7d32",

            secondaryColor: "#c62828",

            accentColor: "#ffd54f",

            textColor: "#ffffff",

            overlay: "rgba(0,0,0,.35)",

            offer: "🎄 Goa • Kerala • Winter Holidays",

            cta: "Explore Christmas Trips",

            subtitle: "Holiday Season Sale",

            pill: "🎄",

            liveTicker: [

                {
                    icon: "🎄",
                    text: "Christmas Holiday Deals Live",
                    color: "green"
                },

                {
                    icon: "🏖",
                    text: "Goa Christmas Packages Trending",
                    color: "blue"
                },

                {
                    icon: "🎁",
                    text: "Holiday Cashback Available",
                    color: "red"
                }

            ],

            urgency: [

                "🎄 Christmas Offers Live",

                "🏖 Beach Holidays Filling",

                "✈ Winter Escapes Trending",

                "🎁 Holiday Cashback"

            ],

            countdown: true,

            expiryHour: 23,

            expiryMinute: 59,

            countdownText: "🎄 Offer Ends In",

            urgencyColor: "#ff5722",

            progressColor: "#ffd54f",

            progressBg: "rgba(255,255,255,.25)",

            countdownColor: "#ffffff",

            countdownBg: "rgba(0,0,0,.30)",

            typingTexts: [

                "🎄 Merry Christmas",

                "🏖 Goa Holiday Packages",

                "✈ Winter Escapes",

                "🎁 Holiday Cashback",

                "🌍 Celebrate Around The World"

            ],

            heroImage:
                "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?auto=format&fit=crop&w=2000&q=80"

        },

    ],

    /*=========================
BRAND
=========================*/

    brand: {

        badge: "Welcome to RanSan Travels",

        company: "RanSan Travels",

        city: "Chennai",

        tagline: "Travel Smarter With RanSan"

    },

    /*=========================
HERO BADGE
=========================*/

    badgeTexts: [

        "Welcome to RanSan Travels",

        "Premium Travel Experience Since 2024",

        "✈ Flight • Train • Holiday • Rental",

        "🛡 Trusted by 10,000+ Travelers",

        "💬 24×7 Travel Assistance",

        "🏖 Curated Holiday Experiences",

        "⭐ Rated 4.9 by Happy Customers"

    ],

    /*=========================
    HERO TITLE
    =========================*/

    heroTitles: [

        {

            before: "Travel Smarter With",

            highlight: "RanSan"

        },

        {

            before: "Discover The World With",

            highlight: "RanSan"

        },

        {

            before: "Your Perfect Journey Starts With",

            highlight: "RanSan"

        },

        {

            before: "Premium Travel Experiences By",

            highlight: "RanSan"

        },

        {

            before: "Flights, Holidays & Rentals By",

            highlight: "RanSan"

        }

    ],


    /*=========================
    TYPING TEXT
    =========================*/

    typingTexts: [

        "✈ Flight Booking",

        "🚆 Train Reservations",

        "🚌 Bus Tickets",

        "🏖 Holiday Packages",

        "🚖 Premium Car Rentals",

        "🏨 Hotel Booking",

        "💡 Utility Payments",

        "💬 WhatsApp Support"

    ],


    /*=========================
    ROTATING DESTINATIONS
    =========================*/

    rotatingDestinations: [

        "✈ Flights to Dubai",

        "🏖 Weekend in Bali",

        "🛕 Temple Tour to Tirupati",

        "🌴 Kerala Luxury Escape",

        "🇸🇬 Singapore Family Trip",

        "💕 Honeymoon in Maldives"

    ],


    /*=========================
 SPOTLIGHT
 =========================*/

    spotlightMessages: [

        "✈ Trending Today: Flight Ticket Deals",

        "🚆 Train Tatkal Booking Open",

        "🚌 Weekend Bus Tickets Filling Fast",

        "🏖 Summer Packages Available",

        "🚖 Premium Car Rental Ready",

        "💬 WhatsApp Support Online"

    ],


    /*=========================
    LIVE BOOKINGS
    =========================*/

    liveStats: [

        {

            icon: "✈",

            count: "127",

            label: "Bookings This Week"

        },

        {

            icon: "🔥",

            count: "12",

            label: "Enquiries Today"

        },

        {

            icon: "🚖",

            count: "5",

            label: "Vehicles Ready"

        },

        {

            icon: "🏖",

            count: "3",

            label: "Holiday Deals"

        },

        {

            icon: "⭐",

            count: "4.9",

            label: "Google Rating"

        },

        {

            icon: "💬",

            count: "24/7",

            label: "Travel Support"

        }

    ],


    /*****************************
CTA
*****************************/

    cta: {

        primary: [

            {

                icon: "✈",

                text: "Search Flights",

                link: "#book",

                subtitle: "Instant Booking",

                pill: "🟢",

                color: "blue"

            },

            {

                icon: "🏖",

                text: "Holiday Packages",

                link: "#package",

                subtitle: "Curated Experiences",

                pill: "🏖",

                color: "purple"

            },

            {

                icon: "🚖",

                text: "Car Rentals",

                link: "#rental",

                subtitle: "Premium Fleet",

                pill: "🚖",

                color: "orange"

            },

            {

                icon: "🚆",

                text: "Train Booking",

                link: "#ticket",

                subtitle: "Fast Confirmation",

                pill: "🚆",

                color: "green"

            },

            {

                icon: "💬",

                text: "Live Assistant",

                link: "https://wa.me/918148610567",

                subtitle: "Real Human Support",

                pill: "💬",

                color: "teal"

            }

        ],



        secondary: {

            icon: "🧭",

            text: "Explore Services",

            link: "#services"

        },



        whatsapp: {

            icon: "💬",

            text: "Live Assistant",

            link: "https://wa.me/918148610567",

            subtitle: "Real Human Support"

        }

    },


    /*=========================
    SEASONAL
    =========================*/

    seasonalMessages: [

        {

            icon: "🌸",

            title: "Summer Escapes",

            message: "Exclusive holiday packages available."

        },

        {

            icon: "🪔",

            title: "Festival Specials",

            message: "Celebrate with unforgettable family journeys."

        },

        {

            icon: "🎄",

            title: "Holiday Season",

            message: "Premium festive travel offers are live."

        }

    ],


    /*=========================
    TRUST METRICS
    =========================*/

    trustMetrics: {

        travellers: "10000+",

        googleReviews: "5000+",

        rating: "4.9",

        support: "24/7"

    }



};