/* EDIT CONTENT HERE. See EDITING.md for the schema and examples. */
/* Events: each has a date (YYYY-MM-DD). Upcoming events glow on the 3D path at Events;
   once the date has passed, the event is "written" into the Events memory bank (the gallery).
   Memory banks: one per section (memoryBanks). Items in `memory` name their bank and appear
   once their date has passed — projects in Impact, reports in Trust.
   Story: the numbers and the "what's next" items at the start of the 2D page (placeholders).
   Ecosystem: the modules that connect to the chip package at the end of the 2D page.
   Events, memory items and partners are empty until real ones are confirmed: never add invented ones.
   Section texts come from the foundation's website content document (EN); the Armenian is a draft for review. */
const SITE_CONTENT = {
  "brand": {
    "name": "SemiTec",
    "subtitle": [
      "FOUNDATION",
      "ՀԻՄՆԱԴՐԱՄ"
    ],
    "tagline": [
      "ADVANCING ARMENIA’S SEMICONDUCTOR FUTURE",
      "ՀԱՅԱՍՏԱՆԻ ԿԻՍԱՀԱՂՈՐԴՉԱՅԻՆ ԱՊԱԳԱՆ"
    ]
  },
  "sections": [
    {
      "id": "overview",
      "label": [
        "Overview",
        "Ընդհանուր"
      ],
      "title": [
        "Advancing Armenia's\nsemiconductor future.",
        "Զարգացնելով Հայաստանի\nկիսահաղորդչային ապագան։"
      ],
      "intro": [
        "Connecting people, knowledge, and opportunities.",
        "Կապում ենք մարդկանց, գիտելիքն ու հնարավորությունները։"
      ],
      "text": [
        [
          "SemiTec Foundation is dedicated to advancing Armenia's semiconductor ecosystem by strengthening connections between education, scientific research, industry, and the wider community.",
          "SemiTec հիմնադրամը նպատակ ունի զարգացնել Հայաստանի կիսահաղորդչային էկոհամակարգը՝ ամրապնդելով կապերը կրթության, գիտական հետազոտությունների, արդյունաբերության և լայն հանրության միջև։"
        ]
      ],
      "items": [
        [
          "Building connections",
          "Կառուցում ենք կապեր"
        ],
        [
          "Creating opportunities",
          "Ստեղծում ենք հնարավորություններ"
        ],
        [
          "Advancing together",
          "Առաջ ենք գնում միասին"
        ]
      ],
      "media": "wafer",
      "children": []
    },
    {
      "id": "purpose",
      "label": [
        "About",
        "Մեր մասին"
      ],
      "title": [
        "A shared commitment to\ntechnological progress.",
        "Ընդհանուր նվիրում\nտեխնոլոգիական առաջընթացին։"
      ],
      "intro": [
        "SemiTec Foundation is an initiative dedicated to supporting the long-term development of Armenia's semiconductor ecosystem.",
        "SemiTec հիմնադրամը նախաձեռնություն է, որը նպատակ ունի աջակցել Հայաստանի կիսահաղորդչային էկոհամակարգի երկարաժամկետ զարգացմանը։"
      ],
      "text": [
        [
          "We believe that sustainable progress requires more than technical expertise. It depends on strong connections between people, educational institutions, research communities, and industry. Our goal is to help build an environment where knowledge is shared, talent is developed, and ideas have the opportunity to become meaningful achievements.",
          "Մենք համոզված ենք, որ կայուն առաջընթացի համար միայն տեխնիկական փորձառությունը բավարար չէ։ Այն պահանջում է ամուր կապեր մարդկանց, կրթական հաստատությունների, հետազոտական համայնքների և արդյունաբերության միջև։ Մեր նպատակն է օգնել ստեղծել միջավայր, որտեղ գիտելիքը կիսվում է, տաղանդը զարգանում է, իսկ գաղափարները հնարավորություն են ստանում դառնալու իմաստալից ձեռքբերումներ։"
        ]
      ],
      "items": [
        [
          "Who we are",
          "Ովքեր ենք մենք"
        ],
        [
          "Mission & vision",
          "Առաքելություն և տեսլական"
        ],
        [
          "Our values",
          "Մեր արժեքները"
        ],
        [
          "Our story",
          "Մեր պատմությունը"
        ]
      ],
      "media": "wafer",
      "children": [
        {
          "id": "who",
          "title": [
            "Who we are",
            "Ովքեր ենք մենք"
          ],
          "intro": [
            "A nonprofit initiative for Armenia's semiconductor and microelectronics ecosystem.",
            "Ոչ առևտրային նախաձեռնություն՝ Հայաստանի կիսահաղորդչային և միկրոէլեկտրոնիկայի էկոհամակարգի համար։"
          ],
          "items": [],
          "children": [],
          "text": [
            [
              "SemiTec Foundation is a nonprofit initiative established to contribute to the development of Armenia's semiconductor and microelectronics ecosystem.",
              "SemiTec հիմնադրամը ոչ առևտրային նախաձեռնություն է, որը ստեղծվել է նպաստելու Հայաստանի կիսահաղորդչային և միկրոէլեկտրոնիկայի էկոհամակարգի զարգացմանը։"
            ],
            [
              "The foundation seeks to bring together individuals and organizations who share an interest in advancing technological education, scientific research, engineering expertise, and innovation.",
              "Հիմնադրամը ձգտում է համախմբել անհատների և կազմակերպությունների, որոնց հետաքրքրում է տեխնոլոգիական կրթության, գիտական հետազոտությունների, ինժեներական փորձառության և նորարարության զարգացումը։"
            ],
            [
              "We believe that Armenia's technological future can be strengthened through collaboration, accessible knowledge, and opportunities that encourage people to learn, experiment, research, and create.",
              "Մենք հավատում ենք, որ Հայաստանի տեխնոլոգիական ապագան կարելի է ամրապնդել համագործակցության, հասանելի գիտելիքի և այնպիսի հնարավորությունների միջոցով, որոնք մարդկանց խրախուսում են սովորել, փորձարկել, հետազոտել և ստեղծել։"
            ]
          ],
          "media": "wafer"
        },
        {
          "id": "why",
          "title": [
            "Why we exist",
            "Ինչու ենք մենք գոյություն ունենում"
          ],
          "intro": [
            "Education, research and industry do not always develop in close coordination.",
            "Կրթությունը, հետազոտությունը և արդյունաբերությունը միշտ չէ, որ զարգանում են սերտ համագործակցությամբ։"
          ],
          "items": [],
          "children": [],
          "text": [
            [
              "The semiconductor industry is built upon a complex relationship between scientific discovery, engineering expertise, education, and industrial innovation.",
              "Կիսահաղորդչային արդյունաբերությունը հիմնված է գիտական հայտնագործությունների, ինժեներական փորձառության, կրթության և արդյունաբերական նորարարության բարդ փոխկապակցվածության վրա։"
            ],
            [
              "However, these areas do not always develop in close coordination. Educational programs may lack exposure to current engineering challenges, researchers may have limited opportunities to collaborate with industry, and talented individuals may struggle to find the resources or professional networks needed to develop their ideas.",
              "Սակայն այս ոլորտները միշտ չէ, որ զարգանում են սերտ համաձայնեցվածությամբ։ Կրթական ծրագրերը կարող են կտրված լինել այսօրվա ինժեներական խնդիրներից, հետազոտողները կարող են սահմանափակ հնարավորություններ ունենալ արդյունաբերության հետ համագործակցելու համար, իսկ տաղանդավոր մարդիկ կարող են դժվարությամբ գտնել իրենց գաղափարները զարգացնելու համար անհրաժեշտ ռեսուրսներն ու մասնագիտական կապերը։"
            ],
            [
              "SemiTec Foundation aims to help address these challenges by encouraging cooperation, supporting educational and research initiatives, and creating opportunities for knowledge exchange.",
              "SemiTec հիմնադրամը ձգտում է օգնել լուծելու այս խնդիրները՝ խրախուսելով համագործակցությունը, աջակցելով կրթական և հետազոտական նախաձեռնություններին և ստեղծելով գիտելիքի փոխանակման հնարավորություններ։"
            ]
          ],
          "media": "wafer"
        },
        {
          "id": "mission",
          "title": [
            "Our mission",
            "Մեր առաքելությունը"
          ],
          "intro": [
            "To strengthen Armenia's semiconductor ecosystem by connecting education, research, industry, and community through collaborative initiatives, knowledge sharing, and opportunities for technological development.",
            "Ամրապնդել Հայաստանի կիսահաղորդչային էկոհամակարգը՝ կապելով կրթությունը, հետազոտությունը, արդյունաբերությունը և համայնքը համատեղ նախաձեռնությունների, գիտելիքի փոխանակման և տեխնոլոգիական զարգացման հնարավորությունների միջոցով։"
          ],
          "items": [],
          "children": [],
          "media": "wafer"
        },
        {
          "id": "vision",
          "title": [
            "Our vision",
            "Մեր տեսլականը"
          ],
          "intro": [
            "An Armenia with a dynamic, interconnected, and internationally engaged semiconductor ecosystem, where talented individuals have the knowledge, resources, and opportunities to contribute to scientific and technological advancement.",
            "Հայաստան՝ դինամիկ, փոխկապակցված և միջազգայնորեն ներգրավված կիսահաղորդչային էկոհամակարգով, որտեղ տաղանդավոր մարդիկ ունեն գիտելիք, ռեսուրսներ և հնարավորություններ՝ նպաստելու գիտական և տեխնոլոգիական առաջընթացին։"
          ],
          "items": [],
          "children": [],
          "media": "wafer"
        },
        {
          "id": "values",
          "title": [
            "Our values",
            "Մեր արժեքները"
          ],
          "intro": [
            "Six values guide how we work.",
            "Վեց արժեք, որոնք ուղղորդում են մեր աշխատանքը։"
          ],
          "items": [],
          "children": [
            {
              "id": "knowledge",
              "title": [
                "Knowledge and education",
                "Գիտելիք և կրթություն"
              ],
              "intro": [
                "Accessible, high-quality knowledge is essential for technological progress.",
                "Հասանելի և որակյալ գիտելիքը տեխնոլոգիական առաջընթացի հիմքն է։"
              ],
              "items": [],
              "children": [],
              "media": "wafer"
            },
            {
              "id": "collaboration",
              "title": [
                "Collaboration",
                "Համագործակցություն"
              ],
              "intro": [
                "Cooperation between individuals, universities, research institutions, companies, and professional communities.",
                "Անհատների, համալսարանների, հետազոտական հաստատությունների, ընկերությունների և մասնագիտական համայնքների միջև։"
              ],
              "items": [],
              "children": [],
              "media": "wafer"
            },
            {
              "id": "innovation",
              "title": [
                "Innovation",
                "Նորարարություն"
              ],
              "intro": [
                "Curiosity, experimentation, research, and practical solutions to meaningful challenges.",
                "Հետաքրքրասիրություն, փորձարկում, հետազոտություն և գործնական լուծումներ իմաստալից խնդիրների համար։"
              ],
              "items": [],
              "children": [],
              "media": "wafer"
            },
            {
              "id": "openness",
              "title": [
                "Openness",
                "Բացություն"
              ],
              "intro": [
                "The responsible exchange of knowledge, ideas, and experiences that benefit the broader community.",
                "Գիտելիքի, գաղափարների և փորձի պատասխանատու փոխանակում՝ ի օգուտ լայն համայնքի։"
              ],
              "items": [],
              "children": [],
              "media": "wafer"
            },
            {
              "id": "integrity",
              "title": [
                "Integrity and responsibility",
                "Ազնվություն և պատասխանատվություն"
              ],
              "intro": [
                "Transparent governance, responsible use of resources, and accountability to our community and supporters.",
                "Թափանցիկ կառավարում, ռեսուրսների պատասխանատու օգտագործում և հաշվետվողականություն մեր համայնքի ու աջակիցների առջև։"
              ],
              "items": [],
              "children": [],
              "media": "wafer"
            },
            {
              "id": "long-term",
              "title": [
                "Long-term development",
                "Երկարաժամկետ զարգացում"
              ],
              "intro": [
                "Initiatives that create lasting educational, scientific, and technological value.",
                "Նախաձեռնություններ, որոնք ստեղծում են տևական կրթական, գիտական և տեխնոլոգիական արժեք։"
              ],
              "items": [],
              "children": [],
              "media": "wafer"
            }
          ],
          "media": "wafer",
          "branchAfter": 0.3
        },
        {
          "id": "story",
          "title": [
            "Our story: Mount Aragats",
            "Մեր պատմությունը՝ Արագած լեռը"
          ],
          "intro": [
            "Mount Aragats symbolizes the foundation's connection to Armenia and its belief in the country's technological potential.",
            "Արագած լեռը խորհրդանշում է հիմնադրամի կապը Հայաստանի հետ և հավատը երկրի տեխնոլոգիական ներուժին։"
          ],
          "items": [],
          "children": [],
          "text": [
            [
              "Its four peaks represent four interconnected strategic directions: education, research, collaboration, and community. The journey toward these peaks symbolizes collective effort, continuous learning, and the pursuit of ambitious objectives.",
              "Նրա չորս գագաթները ներկայացնում են չորս փոխկապակցված ռազմավարական ուղղություն՝ կրթություն, հետազոտություն, համագործակցություն և համայնք։ Այս գագաթներին տանող ճանապարհը խորհրդանշում է համատեղ ջանքը, շարունակական ուսումը և հավակնոտ նպատակների ձգտումը։"
            ],
            [
              "Quartz found in the Aragats region provides an additional symbolic connection to silicon and semiconductor technology. This symbolism does not imply that the local quartz is suitable for semiconductor manufacturing.",
              "Արագածի տարածաշրջանում հայտնաբերվող քվարցը լրացուցիչ խորհրդանշական կապ է ստեղծում սիլիցիումի և կիսահաղորդչային տեխնոլոգիաների հետ։ Այս խորհրդանիշը չի ենթադրում, որ տեղական քվարցը պիտանի է կիսահաղորդիչների արտադրության համար։"
            ],
            [
              "Together, these elements express a central idea: meaningful progress is achieved when people combine their knowledge, abilities, and determination toward shared goals.",
              "Միասին այս տարրերն արտահայտում են մեկ հիմնական գաղափար՝ իմաստալից առաջընթացը ձեռք է բերվում, երբ մարդիկ միավորում են իրենց գիտելիքը, կարողություններն ու վճռականությունը ընդհանուր նպատակների համար։"
            ]
          ],
          "media": "wafer"
        }
      ]
    },
    {
      "id": "focus",
      "label": [
        "Focus",
        "Ուղղություններ"
      ],
      "title": [
        "Four interconnected directions.\nOne shared future.",
        "Չորս փոխկապակցված ուղղություն։\nՄեկ ընդհանուր ապագա։"
      ],
      "intro": [
        "We concentrate on the foundations of long-term technological development: education, scientific research, industry collaboration, and community engagement.",
        "Մենք կենտրոնանում ենք երկարաժամկետ տեխնոլոգիական զարգացման հիմքերի վրա՝ կրթություն, գիտական հետազոտություն, համագործակցություն արդյունաբերության հետ և համայնքի ներգրավվածություն։"
      ],
      "text": [
        [
          "By strengthening these interconnected areas, SemiTec aims to help create an ecosystem where knowledge, experience, and opportunities can flow between people and institutions. Rather than addressing these areas independently, we aim to encourage collaboration between them.",
          "Ամրապնդելով այս փոխկապակցված ոլորտները՝ SemiTec-ը ձգտում է օգնել ստեղծել էկոհամակարգ, որտեղ գիտելիքը, փորձը և հնարավորությունները կարող են շրջանառվել մարդկանց և հաստատությունների միջև։ Այս ոլորտներին առանձին-առանձին անդրադառնալու փոխարեն մենք ձգտում ենք խրախուսել դրանց միջև համագործակցությունը։"
        ]
      ],
      "items": [
        [
          "Education",
          "Կրթություն"
        ],
        [
          "Research",
          "Հետազոտություն"
        ],
        [
          "Collaboration",
          "Համագործակցություն"
        ],
        [
          "Community",
          "Համայնք"
        ]
      ],
      "media": "learning",
      "children": [
        {
          "id": "education",
          "title": [
            "Education and talent development",
            "Կրթություն և տաղանդների զարգացում"
          ],
          "intro": [
            "Empowering the next generation of engineers and researchers.",
            "Աջակցում ենք ինժեներների և հետազոտողների նոր սերնդին։"
          ],
          "items": [
            [
              "Semiconductor fundamentals",
              "Կիսահաղորդիչների հիմունքներ"
            ],
            [
              "Microelectronics",
              "Միկրոէլեկտրոնիկա"
            ],
            [
              "Digital design",
              "Թվային նախագծում"
            ],
            [
              "Verification",
              "Վերիֆիկացիա"
            ],
            [
              "FPGA technologies",
              "FPGA տեխնոլոգիաներ"
            ],
            [
              "Electronic design automation",
              "Էլեկտրոնային նախագծման ավտոմատացում"
            ]
          ],
          "children": [],
          "text": [
            [
              "Education is the foundation of technological progress. SemiTec aims to support technical knowledge and practical engineering skills through educational resources, workshops, training activities, and cooperation with academic institutions.",
              "Կրթությունը տեխնոլոգիական առաջընթացի հիմքն է։ SemiTec-ը ձգտում է աջակցել տեխնիկական գիտելիքներին և գործնական ինժեներական հմտություններին՝ կրթական ռեսուրսների, սեմինարների, վերապատրաստումների և ակադեմիական հաստատությունների հետ համագործակցության միջոցով։"
            ],
            [
              "We seek to connect theoretical foundations with practical experience and real-world engineering challenges.",
              "Մենք ձգտում ենք կապել տեսական հիմքերը գործնական փորձի և իրական ինժեներական խնդիրների հետ։"
            ]
          ],
          "media": "learning"
        },
        {
          "id": "research",
          "title": [
            "Research and innovation",
            "Հետազոտություն և նորարարություն"
          ],
          "intro": [
            "Transforming scientific curiosity into meaningful discoveries and solutions.",
            "Գիտական հետաքրքրասիրությունը վերածում ենք իմաստալից բացահայտումների և լուծումների։"
          ],
          "items": [],
          "children": [],
          "text": [
            [
              "Research plays a critical role in advancing technology and developing new capabilities. SemiTec aims to encourage research activities connecting academic interests with emerging technological challenges and practical engineering needs.",
              "Հետազոտությունը կարևոր դեր ունի տեխնոլոգիաների զարգացման և նոր կարողությունների ստեղծման գործում։ SemiTec-ը ձգտում է խրախուսել հետազոտական աշխատանքներ, որոնք ակադեմիական հետաքրքրությունները կապում են նոր տեխնոլոգիական մարտահրավերների և գործնական ինժեներական կարիքների հետ։"
            ],
            [
              "We seek to support research ideas, collaborative projects, experimental development, and opportunities to investigate relevant technical problems.",
              "Մենք ձգտում ենք աջակցել հետազոտական գաղափարներին, համատեղ նախագծերին, փորձարարական մշակումներին և արդիական տեխնիկական խնդիրներ ուսումնասիրելու հնարավորություններին։"
            ]
          ],
          "media": "learning"
        },
        {
          "id": "industry",
          "title": [
            "Industry and academic collaboration",
            "Արդյունաբերության և ակադեմիայի համագործակցություն"
          ],
          "intro": [
            "Connecting knowledge with real-world challenges.",
            "Կապում ենք գիտելիքը իրական խնդիրների հետ։"
          ],
          "items": [],
          "children": [],
          "text": [
            [
              "Cooperation between academia and industry creates opportunities for educational improvement and technological innovation. SemiTec seeks to facilitate dialogue between universities, researchers, engineers, and companies to identify challenges, exchange expertise, and explore joint initiatives.",
              "Ակադեմիայի և արդյունաբերության համագործակցությունը հնարավորություններ է ստեղծում կրթության բարելավման և տեխնոլոգիական նորարարության համար։ SemiTec-ը ձգտում է նպաստել երկխոսությանը համալսարանների, հետազոտողների, ինժեներների և ընկերությունների միջև՝ խնդիրները բացահայտելու, փորձ փոխանակելու և համատեղ նախաձեռնություններ քննարկելու համար։"
            ],
            [
              "We aim to help transform practical industry observations into educational projects, research questions, and collaborative activities.",
              "Մենք ձգտում ենք օգնել արդյունաբերության գործնական դիտարկումները վերածել կրթական նախագծերի, հետազոտական հարցերի և համատեղ գործողությունների։"
            ]
          ],
          "media": "learning"
        },
        {
          "id": "community",
          "title": [
            "Community and knowledge exchange",
            "Համայնք և գիտելիքի փոխանակում"
          ],
          "intro": [
            "Building a connected and engaged technological community.",
            "Կառուցում ենք փոխկապակցված և ներգրավված տեխնոլոգիական համայնք։"
          ],
          "items": [],
          "children": [],
          "text": [
            [
              "Technological progress benefits from communities where people exchange ideas, learn from different experiences, and work toward shared objectives. SemiTec aims to bring together students, educators, researchers, engineers, and organizations through discussions, events, mentorship, and community activities.",
              "Տեխնոլոգիական առաջընթացին նպաստում են համայնքները, որտեղ մարդիկ փոխանակում են գաղափարներ, սովորում տարբեր փորձից և աշխատում ընդհանուր նպատակների համար։ SemiTec-ը ձգտում է համախմբել ուսանողներին, դասախոսներին, հետազոտողներին, ինժեներներին և կազմակերպություններին քննարկումների, միջոցառումների, մենթորության և համայնքային գործողությունների միջոցով։"
            ],
            [
              "We seek to encourage continuous learning, constructive discussion, and shared responsibility for technological development.",
              "Մենք ձգտում ենք խրախուսել շարունակական ուսումը, կառուցողական քննարկումը և տեխնոլոգիական զարգացման համար ընդհանուր պատասխանատվությունը։"
            ]
          ],
          "media": "learning"
        }
      ]
    },
    {
      "id": "initiatives",
      "label": [
        "Programs",
        "Ծրագրեր"
      ],
      "title": [
        "Turning ideas into\nopportunities for growth.",
        "Գաղափարները վերածում ենք\nաճի հնարավորությունների։"
      ],
      "intro": [
        "Meaningful progress begins when ideas are transformed into action. SemiTec develops and supports initiatives that encourage learning, research, experimentation, and cooperation.",
        "Իմաստալից առաջընթացը սկսվում է, երբ գաղափարները վերածվում են գործողության։ SemiTec-ը մշակում և աջակցում է նախաձեռնություններ, որոնք խրախուսում են ուսումը, հետազոտությունը, փորձարկումը և համագործակցությունը։"
      ],
      "text": [
        [
          "Our programs are designed to encourage active participation, promote knowledge exchange, and support long-term educational and technological development. SemiTec Academy is available now; the other programs below are planned, and each will show its status as it starts.",
          "Մեր ծրագրերը նախատեսված են խրախուսելու ակտիվ մասնակցությունը, նպաստելու գիտելիքի փոխանակմանը և աջակցելու երկարաժամկետ կրթական և տեխնոլոգիական զարգացմանը։ SemiTec Ակադեմիան արդեն հասանելի է․ ստորև ներկայացված մյուս ծրագրերը նախատեսված են, և յուրաքանչյուրի կարգավիճակը կցուցադրվի դրա մեկնարկին զուգընթաց։"
        ]
      ],
      "items": [
        [
          "SemiTec Academy",
          "SemiTec Ակադեմիա"
        ],
        [
          "Educational programs",
          "Կրթական ծրագրեր"
        ],
        [
          "Technical challenges",
          "Տեխնիկական մարտահրավերներ"
        ],
        [
          "Industry–academia dialogue",
          "Արդյունաբերություն–ակադեմիա երկխոսություն"
        ],
        [
          "Hackathons",
          "Հաքաթոններ"
        ],
        [
          "Open knowledge",
          "Բաց գիտելիք"
        ],
        [
          "Mentorship",
          "Մենթորություն"
        ]
      ],
      "media": "learning",
      "children": [
        {
          "id": "academy",
          "title": [
            "SemiTec Academy",
            "SemiTec Ակադեմիա"
          ],
          "intro": [
            "A free, open-source learning app with course packages for students.",
            "Անվճար, բաց կոդով ուսումնական հավելված՝ ուսանողների համար դասընթացային փաթեթներով։"
          ],
          "items": [],
          "text": [
            [
              "SemiTec Academy is the foundation's desktop learning app. Students install it once, add course packages and study on their own computer: interactive trainings with quizzes, labs with source files, readings, videos and projects. Progress stays on the student's computer; no server or sign-up is needed.",
              "SemiTec Ակադեմիան հիմնադրամի ուսումնական համակարգչային հավելվածն է։ Ուսանողները մեկ անգամ տեղադրում են այն, ավելացնում դասընթացային փաթեթներ և սովորում իրենց համակարգչում՝ ինտերակտիվ դասընթացներ թեստերով, լաբորատոր աշխատանքներ աղբյուր ֆայլերով, ընթերցանյութեր, տեսանյութեր և նախագծեր։ Առաջընթացը պահվում է ուսանողի համակարգչում․ սերվեր կամ գրանցում պետք չէ։"
            ],
            [
              "The app, the course materials and the templates for creating them are three open projects, so universities and companies can use them and publish their own courses.",
              "Հավելվածը, դասընթացային նյութերը և դրանք ստեղծելու ձևանմուշները երեք բաց նախագծեր են, որպեսզի համալսարաններն ու ընկերությունները կարողանան օգտագործել դրանք և հրապարակել իրենց սեփական դասընթացները։"
            ]
          ],
          "links": [
            {
              "label": [
                "Download the app",
                "Ներբեռնել հավելվածը"
              ],
              "href": "https://github.com/SemiTecFoundation/semitec-academy/releases/latest"
            },
            {
              "label": [
                "See the introduction",
                "Դիտել ներածությունը"
              ],
              "href": "https://semitecfoundation.github.io/semitec-academy/"
            }
          ],
          "children": [],
          "media": "learning",
          "showcase": [
            {
              "id": "app",
              "title": [
                "Academy app",
                "Ակադեմիա հավելված"
              ],
              "intro": [
                "Install once, add packages, study offline and resume where you left off.",
                "Տեղադրեք մեկ անգամ, ավելացրեք փաթեթներ, սովորեք առանց համացանցի և շարունակեք այնտեղից, որտեղ կանգ եք առել։"
              ],
              "details": [
                [
                  "Students install the app once on Windows, macOS or Linux, choose a folder for their data and create a local account. They add course packages from the catalog or as a file, enroll, and follow the course order or a weekly study plan.",
                  "Ուսանողները մեկ անգամ տեղադրում են հավելվածը Windows, macOS կամ Linux համակարգում, ընտրում են թղթապանակ իրենց տվյալների համար և ստեղծում տեղային հաշիվ։ Նրանք ավելացնում են դասընթացային փաթեթներ կատալոգից կամ ֆայլից, գրանցվում և հետևում են դասընթացի հերթականությանը կամ շաբաթական ուսումնական պլանին։"
                ],
                [
                  "Trainings unlock topic by topic with quizzes; labs bring their manual, steps and source files together; progress and optional certificates stay on the student's computer.",
                  "Դասընթացները բացվում են թեմա առ թեմա՝ թեստերի միջոցով․ լաբորատոր աշխատանքները միավորում են ձեռնարկը, քայլերը և աղբյուր ֆայլերը․ առաջընթացը և վկայականները պահվում են ուսանողի համակարգչում։"
                ]
              ],
              "items": [
                [
                  "Trainings, labs, readings, videos and projects",
                  "Դասընթացներ, լաբորատոր աշխատանքներ, ընթերցանյութեր, տեսանյութեր և նախագծեր"
                ],
                [
                  "Study plans, calendar and optional certificates",
                  "Ուսումնական պլաններ, օրացույց և ըստ ցանկության՝ վկայականներ"
                ]
              ],
              "links": [
                {
                  "label": [
                    "Download",
                    "Ներբեռնել"
                  ],
                  "href": "https://github.com/SemiTecFoundation/semitec-academy/releases/latest"
                },
                {
                  "label": [
                    "Introduction",
                    "Ներածություն"
                  ],
                  "href": "https://semitecfoundation.github.io/semitec-academy/"
                },
                {
                  "label": [
                    "Source code",
                    "Աղբյուր կոդ"
                  ],
                  "href": "https://github.com/SemiTecFoundation/semitec-academy"
                }
              ],
              "media": "academy-app"
            },
            {
              "id": "materials",
              "title": [
                "Learning materials",
                "Ուսումնական նյութեր"
              ],
              "intro": [
                "Courses published by the foundation appear in the app's catalog automatically.",
                "Հիմնադրամի հրապարակած դասընթացները ինքնաշխատ հայտնվում են հավելվածի կատալոգում։"
              ],
              "details": [
                [
                  "The foundation's course content is open: lectures, interactive trainings, labs and projects, organised by subject. Each released training also opens on its own in a web browser.",
                  "Հիմնադրամի դասընթացային բովանդակությունը բաց է՝ դասախոսություններ, ինտերակտիվ դասընթացներ, լաբորատոր աշխատանքներ և նախագծեր՝ ըստ թեմաների։ Յուրաքանչյուր թողարկված դասընթաց բացվում է նաև առանձին՝ դիտարկիչում։"
                ],
                [
                  "Courses built from it are published as packages in the foundation catalog, which every Academy app already knows: a new course or a new version appears in the app by itself.",
                  "Դրանից կազմված դասընթացները հրապարակվում են որպես փաթեթներ հիմնադրամի կատալոգում, որը յուրաքանչյուր Ակադեմիա հավելված արդեն գիտի․ նոր դասընթացը կամ նոր տարբերակը ինքնին հայտնվում է հավելվածում։"
                ]
              ],
              "items": [
                [
                  "First course: BIST and MBIST, for bachelor students",
                  "Առաջին դասընթաց՝ BIST և MBIST, բակալավրիատի ուսանողների համար"
                ],
                [
                  "Free trainings that also open in a browser",
                  "Անվճար դասընթացներ, որոնք բացվում են նաև դիտարկիչում"
                ]
              ],
              "links": [
                {
                  "label": [
                    "Browse materials",
                    "Դիտել նյութերը"
                  ],
                  "href": "https://semitecfoundation.github.io/semitec-academy-materials/"
                },
                {
                  "label": [
                    "Materials on GitHub",
                    "Նյութերը GitHub-ում"
                  ],
                  "href": "https://github.com/SemiTecFoundation/semitec-academy-materials"
                }
              ],
              "media": "academy-training"
            },
            {
              "id": "templates",
              "title": [
                "Academy Templates",
                "Ակադեմիայի ձևանմուշներ"
              ],
              "intro": [
                "Templates and AI-assistant skills for lecturers and companies who want to publish their own courses.",
                "Ձևանմուշներ և AI օգնականի հմտություններ դասախոսների և ընկերությունների համար, որոնք ցանկանում են հրապարակել իրենց դասընթացները։"
              ],
              "details": [
                [
                  "Academy Templates are ready-made formats and AI-assistant skills for interactive trainings, lab manuals, project briefs and course packages, so a lecturer can turn a topic into material students can use.",
                  "Ակադեմիայի ձևանմուշները պատրաստի ձևաչափեր և AI օգնականի հմտություններ են ինտերակտիվ դասընթացների, լաբորատոր ձեռնարկների, նախագծային առաջադրանքների և դասընթացային փաթեթների համար, որպեսզի դասախոսը կարողանա թեման վերածել ուսանողների համար օգտակար նյութի։"
                ],
                [
                  "Universities and companies can publish their own packages and catalogs without an agreement or approval from the foundation; each publisher stays responsible for its content.",
                  "Համալսարաններն ու ընկերությունները կարող են հրապարակել իրենց փաթեթներն ու կատալոգները առանց հիմնադրամի համաձայնության կամ հաստատման․ յուրաքանչյուր հրատարակիչ պատասխանատու է իր բովանդակության համար։"
                ]
              ],
              "items": [
                [
                  "Trainings, lab manuals, project briefs and course packages",
                  "Դասընթացներ, լաբորատոր ձեռնարկներ, նախագծային առաջադրանքներ և դասընթացային փաթեթներ"
                ],
                [
                  "No agreement or approval from the foundation needed",
                  "Հիմնադրամի համաձայնություն կամ հաստատում պետք չէ"
                ]
              ],
              "links": [
                {
                  "label": [
                    "Academy Templates on GitHub",
                    "Ձևանմուշները GitHub-ում"
                  ],
                  "href": "https://github.com/SemiTecFoundation/semitec-academy-skills"
                }
              ],
              "media": "academy-lab"
            }
          ]
        },
        {
          "id": "education-programs",
          "title": [
            "Educational programs",
            "Կրթական ծրագրեր"
          ],
          "intro": [
            "Making technical knowledge more accessible and practical.",
            "Տեխնիկական գիտելիքը դարձնում ենք ավելի հասանելի և գործնական։"
          ],
          "items": [
            [
              "Status: planned",
              "Կարգավիճակ՝ նախատեսված"
            ],
            [
              "Technical courses",
              "Տեխնիկական դասընթացներ"
            ],
            [
              "Hands-on workshops",
              "Գործնական սեմինարներ"
            ],
            [
              "Laboratory exercises",
              "Լաբորատոր աշխատանքներ"
            ],
            [
              "Educational materials",
              "Կրթական նյութեր"
            ],
            [
              "Collaborative learning projects",
              "Համատեղ ուսումնական նախագծեր"
            ]
          ],
          "children": [],
          "text": [
            [
              "We aim to support educational activities that help students and professionals develop technical foundations, practical skills, and an understanding of modern semiconductor technologies.",
              "Մենք ձգտում ենք աջակցել կրթական գործողություններին, որոնք օգնում են ուսանողներին և մասնագետներին զարգացնել տեխնիկական հիմքեր, գործնական հմտություններ և ժամանակակից կիսահաղորդչային տեխնոլոգիաների ըմբռնում։"
            ]
          ],
          "media": "learning"
        },
        {
          "id": "challenges",
          "title": [
            "Research and technical challenges",
            "Հետազոտական և տեխնիկական մարտահրավերներ"
          ],
          "intro": [
            "Connecting research interests with meaningful engineering problems.",
            "Կապում ենք հետազոտական հետաքրքրությունները իմաստալից ինժեներական խնդիրների հետ։"
          ],
          "items": [
            [
              "Status: planned",
              "Կարգավիճակ՝ նախատեսված"
            ]
          ],
          "children": [],
          "text": [
            [
              "We seek to create opportunities for students, researchers, and industry professionals to identify, discuss, and investigate relevant technical challenges. Through collaborative research topics, experimental projects, and problem-solving activities, we aim to encourage practical innovation and scientific exploration.",
              "Մենք ձգտում ենք ստեղծել հնարավորություններ, որպեսզի ուսանողները, հետազոտողները և արդյունաբերության մասնագետները բացահայտեն, քննարկեն և ուսումնասիրեն արդիական տեխնիկական խնդիրներ։ Համատեղ հետազոտական թեմաների, փորձարարական նախագծերի և խնդիրների լուծման միջոցով մենք ձգտում ենք խրախուսել գործնական նորարարությունը և գիտական որոնումը։"
            ]
          ],
          "media": "learning"
        },
        {
          "id": "dialogue",
          "title": [
            "Industry–academia dialogue",
            "Արդյունաբերություն–ակադեմիա երկխոսություն"
          ],
          "intro": [
            "Creating conversations that lead to action.",
            "Ստեղծում ենք զրույցներ, որոնք հանգեցնում են գործողության։"
          ],
          "items": [
            [
              "Status: planned",
              "Կարգավիճակ՝ նախատեսված"
            ]
          ],
          "children": [],
          "text": [
            [
              "SemiTec aims to organize discussions where industry professionals, students, educators, and researchers can exchange experiences and explore technological challenges. These discussions may help identify educational gaps, emerging technical needs, potential research topics, and opportunities for collaborative projects.",
              "SemiTec-ը ձգտում է կազմակերպել քննարկումներ, որտեղ արդյունաբերության մասնագետները, ուսանողները, դասախոսները և հետազոտողները կարող են կիսվել փորձով և քննարկել տեխնոլոգիական խնդիրներ։ Այս քննարկումները կարող են օգնել բացահայտել կրթական բացերը, նոր տեխնիկական կարիքները, հնարավոր հետազոտական թեմաները և համատեղ նախագծերի հնարավորությունները։"
            ],
            [
              "Our goal is to encourage follow-up activities that transform valuable discussions into practical outcomes.",
              "Մեր նպատակն է խրախուսել շարունակական գործողություններ, որոնք արժեքավոր քննարկումները վերածում են գործնական արդյունքների։"
            ]
          ],
          "media": "learning"
        },
        {
          "id": "hackathons",
          "title": [
            "Hackathons and engineering challenges",
            "Հաքաթոններ և ինժեներական մրցույթներ"
          ],
          "intro": [
            "Learning through experimentation and collaborative problem-solving.",
            "Սովորում ենք փորձարկման և խնդիրների համատեղ լուծման միջոցով։"
          ],
          "items": [
            [
              "Status: planned",
              "Կարգավիճակ՝ նախատեսված"
            ]
          ],
          "children": [],
          "text": [
            [
              "We envision technical competitions and collaborative challenges where participants can apply their knowledge to real engineering problems. Such activities can encourage creativity, teamwork, experimentation, and the development of practical solutions.",
              "Մենք նախատեսում ենք տեխնիկական մրցույթներ և համատեղ մարտահրավերներ, որտեղ մասնակիցները կարող են իրենց գիտելիքը կիրառել իրական ինժեներական խնդիրների վրա։ Նման գործողությունները կարող են խթանել ստեղծագործականությունը, թիմային աշխատանքը, փորձարկումը և գործնական լուծումների մշակումը։"
            ]
          ],
          "media": "learning"
        },
        {
          "id": "open-knowledge",
          "title": [
            "Open knowledge and educational resources",
            "Բաց գիտելիք և կրթական ռեսուրսներ"
          ],
          "intro": [
            "Sharing knowledge for the benefit of the wider community.",
            "Կիսվում ենք գիտելիքով՝ ի օգուտ լայն համայնքի։"
          ],
          "items": [
            [
              "Status: planned",
              "Կարգավիճակ՝ նախատեսված"
            ]
          ],
          "children": [],
          "text": [
            [
              "SemiTec aims to encourage the creation, organization, and responsible sharing of technical resources, including educational materials, research publications, project documentation, and open-source engineering examples.",
              "SemiTec-ը ձգտում է խրախուսել տեխնիկական ռեսուրսների ստեղծումը, կազմակերպումը և պատասխանատու տարածումը, այդ թվում՝ կրթական նյութերի, հետազոտական հրապարակումների, նախագծային փաստաթղթերի և բաց կոդով ինժեներական օրինակների։"
            ],
            [
              "We believe that well-organized, accessible knowledge can support independent learning and long-term community development.",
              "Մենք համոզված ենք, որ լավ կազմակերպված և հասանելի գիտելիքը կարող է աջակցել ինքնուրույն ուսմանը և համայնքի երկարաժամկետ զարգացմանը։"
            ]
          ],
          "media": "learning"
        },
        {
          "id": "mentorship",
          "title": [
            "Mentorship and professional exchange",
            "Մենթորություն և մասնագիտական փոխանակում"
          ],
          "intro": [
            "Connecting experience with potential.",
            "Կապում ենք փորձը ներուժի հետ։"
          ],
          "items": [
            [
              "Status: planned",
              "Կարգավիճակ՝ նախատեսված"
            ],
            [
              "Technical consultations",
              "Տեխնիկական խորհրդատվություններ"
            ],
            [
              "Career discussions",
              "Կարիերային զրույցներ"
            ],
            [
              "Project guidance",
              "Նախագծերի ուղղորդում"
            ],
            [
              "Research-oriented collaboration",
              "Հետազոտական համագործակցություն"
            ]
          ],
          "children": [],
          "text": [
            [
              "We seek to create opportunities for experienced professionals and researchers to share knowledge, provide guidance, and support emerging talent.",
              "Մենք ձգտում ենք հնարավորություններ ստեղծել, որպեսզի փորձառու մասնագետներն ու հետազոտողները կիսվեն գիտելիքով, ուղղորդեն և աջակցեն նոր տաղանդներին։"
            ]
          ],
          "media": "learning"
        }
      ]
    },
    {
      "id": "events",
      "label": [
        "News & Events",
        "Նորություններ"
      ],
      "title": [
        "Where ideas\nmeet people.",
        "Որտեղ գաղափարները\nհանդիպում են մարդկանց։"
      ],
      "intro": [
        "Discover upcoming events, technical discussions, educational activities, and the latest developments from SemiTec Foundation.",
        "Բացահայտեք SemiTec հիմնադրամի առաջիկա միջոցառումները, տեխնիկական քննարկումները, կրթական գործողությունները և վերջին նորությունները։"
      ],
      "text": [
        [
          "We aim to create spaces where people can exchange knowledge, explore new ideas, establish connections, and discover opportunities for collaboration between students, educators, researchers, industry professionals, and organizations.",
          "Մենք ձգտում ենք ստեղծել տարածքներ, որտեղ մարդիկ կարող են փոխանակել գիտելիք, քննարկել նոր գաղափարներ, հաստատել կապեր և բացահայտել համագործակցության հնարավորություններ ուսանողների, դասախոսների, հետազոտողների, արդյունաբերության մասնագետների և կազմակերպությունների միջև։"
        ]
      ],
      "items": [
        [
          "Upcoming events",
          "Առաջիկա միջոցառումներ"
        ],
        [
          "Past activities",
          "Անցած միջոցառումներ"
        ],
        [
          "News",
          "Նորություններ"
        ],
        [
          "Propose an event",
          "Առաջարկել միջոցառում"
        ]
      ],
      "media": "gathering",
      "children": [
        {
          "id": "upcoming",
          "title": [
            "Upcoming events",
            "Առաջիկա միջոցառումներ"
          ],
          "intro": [
            "Planned technical workshops, seminars, discussions, conferences, and community activities.",
            "Նախատեսված տեխնիկական սեմինարներ, դասախոսություններ, քննարկումներ, համաժողովներ և համայնքային միջոցառումներ։"
          ],
          "items": [],
          "children": [],
          "text": [
            [
              "Each announcement will give the date and time, the place or online format, the agenda, the intended audience, the speakers or organizers, and how to register.",
              "Յուրաքանչյուր հայտարարություն կներառի ամսաթիվը և ժամը, վայրը կամ առցանց ձևաչափը, օրակարգը, թիրախային լսարանը, բանախոսներին կամ կազմակերպիչներին և գրանցման կարգը։"
            ]
          ],
          "media": "gathering"
        },
        {
          "id": "past",
          "title": [
            "Past activities",
            "Անցած միջոցառումներ"
          ],
          "intro": [
            "Previous activities, discussions, and events organized or supported by SemiTec.",
            "SemiTec-ի կազմակերպած կամ աջակցած նախորդ միջոցառումներն ու քննարկումները։"
          ],
          "items": [],
          "children": [],
          "text": [
            [
              "Where available, summaries will include key topics, speakers, photographs, presentations, and the opportunities for collaboration that followed.",
              "Հնարավորության դեպքում ամփոփումները կներառեն հիմնական թեմաները, բանախոսներին, լուսանկարները, ներկայացումները և դրանց հետևած համագործակցության հնարավորությունները։"
            ]
          ],
          "media": "gathering"
        },
        {
          "id": "news",
          "title": [
            "News and announcements",
            "Նորություններ և հայտարարություններ"
          ],
          "intro": [
            "New initiatives, organizational developments, collaboration opportunities, educational resources, and other relevant updates.",
            "Նոր նախաձեռնություններ, կազմակերպական զարգացումներ, համագործակցության հնարավորություններ, կրթական ռեսուրսներ և այլ կարևոր թարմացումներ։"
          ],
          "items": [],
          "children": [],
          "media": "gathering"
        },
        {
          "id": "propose",
          "title": [
            "Propose an event",
            "Առաջարկել միջոցառում"
          ],
          "intro": [
            "We welcome suggestions for technical discussions, educational workshops, research seminars, and other activities aligned with the foundation's mission.",
            "Մենք ողջունում ենք տեխնիկական քննարկումների, կրթական սեմինարների, հետազոտական դասախոսությունների և հիմնադրամի առաքելությանը համապատասխան այլ միջոցառումների առաջարկներ։"
          ],
          "items": [],
          "children": [],
          "text": [
            [
              "Individuals and organizations interested in contributing can contact SemiTec to discuss potential opportunities.",
              "Մասնակցել ցանկացող անհատներն ու կազմակերպությունները կարող են կապվել SemiTec-ի հետ՝ հնարավորությունները քննարկելու համար։"
            ]
          ],
          "media": "gathering"
        }
      ]
    },
    {
      "id": "impact",
      "label": [
        "Impact",
        "Ազդեցություն"
      ],
      "title": [
        "Progress that is visible\nand measurable.",
        "Տեսանելի և չափելի\nառաջընթաց։"
      ],
      "intro": [
        "SemiTec Foundation aims to create lasting value through education, research, technological development, and community collaboration.",
        "SemiTec հիմնադրամը ձգտում է ստեղծել տևական արժեք կրթության, հետազոտության, տեխնոլոգիական զարգացման և համայնքային համագործակցության միջոցով։"
      ],
      "text": [
        [
          "As our activities develop, we intend to communicate our progress, achievements, challenges, and use of resources openly.",
          "Մեր գործունեության զարգացմանը զուգընթաց մենք մտադիր ենք բաց հաղորդել մեր առաջընթացի, ձեռքբերումների, դժվարությունների և ռեսուրսների օգտագործման մասին։"
        ]
      ],
      "items": [
        [
          "Our progress",
          "Մեր առաջընթացը"
        ],
        [
          "Measuring our impact",
          "Ազդեցության գնահատում"
        ],
        [
          "Looking ahead",
          "Հայացք ապագային"
        ]
      ],
      "media": "wafer",
      "children": [
        {
          "id": "progress",
          "title": [
            "Our progress",
            "Մեր առաջընթացը"
          ],
          "intro": [
            "Publicly available milestones and activity updates.",
            "Հրապարակային հանգրվաններ և գործունեության թարմացումներ։"
          ],
          "items": [],
          "children": [],
          "text": [
            [
              "We aim to document the development of the foundation and its initiatives. These may include educational programs, research projects, technical events, collaborative initiatives, and community contributions.",
              "Մենք ձգտում ենք փաստագրել հիմնադրամի և նրա նախաձեռնությունների զարգացումը՝ կրթական ծրագրեր, հետազոտական նախագծեր, տեխնիկական միջոցառումներ, համատեղ նախաձեռնություններ և համայնքային ներդրումներ։"
            ]
          ],
          "media": "wafer"
        },
        {
          "id": "measuring",
          "title": [
            "Measuring our impact",
            "Ազդեցության գնահատում"
          ],
          "intro": [
            "Our objective is not simply to organize activities, but to understand the value they create.",
            "Մեր նպատակը ոչ միայն միջոցառումներ կազմակերպելն է, այլև հասկանալը, թե ինչ արժեք են դրանք ստեղծում։"
          ],
          "items": [
            [
              "Participants",
              "Մասնակիցներ"
            ],
            [
              "Educational resources created",
              "Ստեղծված կրթական ռեսուրսներ"
            ],
            [
              "Research outcomes",
              "Հետազոտական արդյունքներ"
            ],
            [
              "Completed projects",
              "Ավարտված նախագծեր"
            ],
            [
              "Collaborative initiatives",
              "Համատեղ նախաձեռնություններ"
            ],
            [
              "Community contributions",
              "Համայնքային ներդրումներ"
            ],
            [
              "Opportunities generated",
              "Ստեղծված հնարավորություններ"
            ]
          ],
          "children": [],
          "text": [
            [
              "We intend to evaluate activities using relevant qualitative and quantitative indicators. Depending on the initiative, these may include:",
              "Մենք մտադիր ենք գնահատել գործունեությունը համապատասխան որակական և քանակական ցուցանիշներով։ Կախված նախաձեռնությունից՝ դրանք կարող են ներառել․"
            ]
          ],
          "media": "wafer"
        },
        {
          "id": "ahead",
          "title": [
            "Looking ahead",
            "Հայացք ապագային"
          ],
          "intro": [
            "Building a sustainable technological ecosystem is a long-term process.",
            "Կայուն տեխնոլոգիական էկոհամակարգի կառուցումը երկարաժամկետ գործընթաց է։"
          ],
          "items": [],
          "children": [],
          "text": [
            [
              "SemiTec intends to develop its activities progressively, learn from experience, evaluate outcomes, and improve its approaches as the foundation grows.",
              "SemiTec-ը մտադիր է զարգացնել իր գործունեությունը աստիճանաբար, սովորել փորձից, գնահատել արդյունքները և կատարելագործել իր մոտեցումները հիմնադրամի աճին զուգընթաց։"
            ]
          ],
          "media": "wafer"
        }
      ]
    },
    {
      "id": "people",
      "label": [
        "Community",
        "Համայնք"
      ],
      "title": [
        "Progress is built\nby people.",
        "Առաջընթացը կառուցում\nեն մարդիկ։"
      ],
      "intro": [
        "Behind every technological achievement are individuals who learn, question, explore, create, and share their knowledge.",
        "Յուրաքանչյուր տեխնոլոգիական ձեռքբերման հետևում կան մարդիկ, ովքեր սովորում են, հարցեր տալիս, որոնում, ստեղծում և կիսվում իրենց գիտելիքով։"
      ],
      "text": [
        [
          "SemiTec aims to bring together students, educators, researchers, engineers, institutions, and organizations who believe in advancing Armenia's semiconductor ecosystem. Meaningful technological development requires cooperation between people with different experiences, perspectives, and expertise.",
          "SemiTec-ը ձգտում է համախմբել ուսանողներին, դասախոսներին, հետազոտողներին, ինժեներներին, հաստատություններին և կազմակերպություններին, ովքեր հավատում են Հայաստանի կիսահաղորդչային էկոհամակարգի զարգացմանը։ Իմաստալից տեխնոլոգիական զարգացումը պահանջում է համագործակցություն տարբեր փորձ, տեսակետ և մասնագիտացում ունեցող մարդկանց միջև։"
        ]
      ],
      "items": [
        [
          "Founders",
          "Հիմնադիրներ"
        ],
        [
          "Leadership",
          "Ղեկավարություն"
        ],
        [
          "Mentors",
          "Մենթորներ"
        ],
        [
          "Universities",
          "Համալսարաններ"
        ],
        [
          "Partners",
          "Գործընկերներ"
        ],
        [
          "The wider community",
          "Լայն համայնք"
        ]
      ],
      "media": "gathering",
      "children": [
        {
          "id": "founders",
          "title": [
            "Our founders",
            "Մեր հիմնադիրները"
          ],
          "intro": [
            "SemiTec was initiated by individuals who believe in strengthening Armenia's semiconductor ecosystem through education, research, and cooperation.",
            "SemiTec-ը նախաձեռնել են մարդիկ, ովքեր հավատում են Հայաստանի կիսահաղորդչային էկոհամակարգի ամրապնդմանը կրթության, հետազոտության և համագործակցության միջոցով։"
          ],
          "items": [
            [
              "Founder profiles will be published here once confirmed.",
              "Հիմնադիրների մասին տեղեկությունը կհրապարակվի այստեղ՝ հաստատվելուց հետո։"
            ]
          ],
          "children": [],
          "text": [
            [
              "The founders' vision is to help establish a lasting foundation for collaborative technological development and community-driven initiatives.",
              "Հիմնադիրների տեսլականն է օգնել ստեղծել տևական հիմք համատեղ տեխնոլոգիական զարգացման և համայնքի կողմից առաջնորդվող նախաձեռնությունների համար։"
            ]
          ],
          "media": "gathering"
        },
        {
          "id": "leadership",
          "title": [
            "Leadership and governance",
            "Ղեկավարություն և կառավարում"
          ],
          "intro": [
            "The foundation's governing bodies are responsible for strategic direction, organizational oversight, and responsible operation.",
            "Հիմնադրամի կառավարման մարմինները պատասխանատու են ռազմավարական ուղղության, կազմակերպական վերահսկողության և պատասխանատու գործունեության համար։"
          ],
          "items": [
            [
              "Appointed members and their responsibilities will be listed here.",
              "Նշանակված անդամներն ու նրանց պարտականությունները կներկայացվեն այստեղ։"
            ]
          ],
          "children": [],
          "media": "gathering"
        },
        {
          "id": "mentors",
          "title": [
            "Professionals and mentors",
            "Մասնագետներ և մենթորներ"
          ],
          "intro": [
            "Experienced engineers, researchers, educators, and other professionals can support knowledge exchange and the development of emerging talent.",
            "Փորձառու ինժեներները, հետազոտողները, դասախոսները և այլ մասնագետներ կարող են աջակցել գիտելիքի փոխանակմանը և նոր տաղանդների զարգացմանը։"
          ],
          "items": [],
          "children": [],
          "text": [
            [
              "SemiTec seeks to encourage their involvement in educational activities, technical discussions, mentorship, and collaborative initiatives.",
              "SemiTec-ը ձգտում է խրախուսել նրանց մասնակցությունը կրթական գործողություններին, տեխնիկական քննարկումներին, մենթորությանը և համատեղ նախաձեռնություններին։"
            ]
          ],
          "media": "gathering"
        },
        {
          "id": "universities",
          "title": [
            "Universities and research institutions",
            "Համալսարաններ և հետազոտական հաստատություններ"
          ],
          "intro": [
            "Academic and research institutions are essential contributors to scientific discovery and technical education.",
            "Ակադեմիական և հետազոտական հաստատությունները գիտական բացահայտումների և տեխնիկական կրթության կարևոր մասնակիցներ են։"
          ],
          "items": [],
          "children": [],
          "text": [
            [
              "We aim to develop constructive relationships with institutions interested in collaborative learning, research activities, and knowledge exchange.",
              "Մենք ձգտում ենք կառուցողական հարաբերություններ զարգացնել այն հաստատությունների հետ, որոնց հետաքրքրում են համատեղ ուսումը, հետազոտական աշխատանքը և գիտելիքի փոխանակումը։"
            ]
          ],
          "media": "gathering"
        },
        {
          "id": "partners",
          "title": [
            "Industry and organizational partners",
            "Արդյունաբերական և կազմակերպական գործընկերներ"
          ],
          "intro": [
            "Companies and organizations can contribute experience, technical challenges, resources, and opportunities for cooperation.",
            "Ընկերություններն ու կազմակերպությունները կարող են ներդնել փորձ, տեխնիկական խնդիրներ, ռեսուրսներ և համագործակցության հնարավորություններ։"
          ],
          "items": [],
          "children": [],
          "text": [
            [
              "SemiTec welcomes discussions with organizations interested in supporting educational, scientific, and technological initiatives. Partners are shown on the chip only with their authorization.",
              "SemiTec-ը ողջունում է քննարկումները այն կազմակերպությունների հետ, որոնք հետաքրքրված են կրթական, գիտական և տեխնոլոգիական նախաձեռնություններին աջակցելով։ Գործընկերները չիպի վրա ցուցադրվում են միայն իրենց համաձայնությամբ։"
            ]
          ],
          "media": "gathering"
        },
        {
          "id": "wider",
          "title": [
            "The wider community",
            "Լայն համայնք"
          ],
          "intro": [
            "Students, independent researchers, professionals, volunteers, and anyone interested in semiconductor technologies are invited to take part.",
            "Ուսանողները, անկախ հետազոտողները, մասնագետները, կամավորները և բոլոր նրանք, ում հետաքրքրում են կիսահաղորդչային տեխնոլոգիաները, հրավիրված են մասնակցելու։"
          ],
          "items": [],
          "children": [],
          "text": [
            [
              "We believe a connected community can create opportunities that would be difficult to achieve individually.",
              "Մենք հավատում ենք, որ փոխկապակցված համայնքը կարող է ստեղծել հնարավորություններ, որոնց դժվար է հասնել առանձին։"
            ]
          ],
          "media": "gathering"
        }
      ]
    },
    {
      "id": "transparency",
      "label": [
        "Transparency",
        "Թափանցիկություն"
      ],
      "title": [
        "Building trust through\naction and accountability.",
        "Վստահություն՝ գործողության\nև հաշվետվողականության միջոցով։"
      ],
      "intro": [
        "We believe that meaningful progress should be visible, measurable, and supported by responsible organizational practices.",
        "Մենք համոզված ենք, որ իմաստալից առաջընթացը պետք է լինի տեսանելի, չափելի և հիմնված պատասխանատու կազմակերպական պրակտիկայի վրա։"
      ],
      "text": [
        [
          "SemiTec is committed to transparent governance, responsible use of resources, and communicating the progress, outcomes, and challenges of its initiatives.",
          "SemiTec-ը հավատարիմ է թափանցիկ կառավարմանը, ռեսուրսների պատասխանատու օգտագործմանը և իր նախաձեռնությունների առաջընթացի, արդյունքների ու դժվարությունների մասին բաց հաղորդակցությանը։"
        ]
      ],
      "items": [
        [
          "Our commitment",
          "Մեր պարտավորությունը"
        ],
        [
          "Governance",
          "Կառավարում"
        ],
        [
          "Public documents",
          "Հրապարակային փաստաթղթեր"
        ],
        [
          "Use of resources",
          "Ռեսուրսների օգտագործում"
        ]
      ],
      "media": "learning",
      "children": [
        {
          "id": "commitment",
          "title": [
            "Our commitment",
            "Մեր պարտավորությունը"
          ],
          "intro": [
            "Trust must be earned through responsible decisions, transparent operations, and demonstrable results.",
            "Վստահությունը պետք է վաստակել պատասխանատու որոշումներով, թափանցիկ գործունեությամբ և ապացուցելի արդյունքներով։"
          ],
          "items": [],
          "children": [],
          "media": "learning"
        },
        {
          "id": "governance",
          "title": [
            "Governance",
            "Կառավարում"
          ],
          "intro": [
            "The foundation operates through its governing bodies and in accordance with its charter and applicable legislation.",
            "Հիմնադրամը գործում է իր կառավարման մարմինների միջոցով՝ համաձայն իր կանոնադրության և գործող օրենսդրության։"
          ],
          "items": [],
          "children": [],
          "text": [
            [
              "We seek to maintain clear responsibilities, transparent decision-making, and appropriate oversight.",
              "Մենք ձգտում ենք պահպանել հստակ պարտականություններ, թափանցիկ որոշումների կայացում և պատշաճ վերահսկողություն։"
            ]
          ],
          "media": "learning"
        },
        {
          "id": "reports",
          "title": [
            "Public documents",
            "Հրապարակային փաստաթղթեր"
          ],
          "intro": [
            "Organizational documents will be published here when available.",
            "Կազմակերպական փաստաթղթերը կհրապարակվեն այստեղ՝ հասանելի դառնալուն պես։"
          ],
          "items": [
            [
              "Foundation charter",
              "Հիմնադրամի կանոնադրություն"
            ],
            [
              "Registration information",
              "Գրանցման տվյալներ"
            ],
            [
              "Governance structure",
              "Կառավարման կառուցվածք"
            ],
            [
              "Annual activity reports",
              "Տարեկան գործունեության հաշվետվություններ"
            ],
            [
              "Financial reports and disclosures",
              "Ֆինանսական հաշվետվություններ"
            ],
            [
              "Organizational policies",
              "Կազմակերպական քաղաքականություններ"
            ]
          ],
          "children": [],
          "media": "learning"
        },
        {
          "id": "resources",
          "title": [
            "Responsible use of resources",
            "Ռեսուրսների պատասխանատու օգտագործում"
          ],
          "intro": [
            "Financial, material, and professional contributions are essential to supporting the foundation's objectives.",
            "Ֆինանսական, նյութական և մասնագիտական ներդրումները էական են հիմնադրամի նպատակներին աջակցելու համար։"
          ],
          "items": [],
          "children": [],
          "text": [
            [
              "We aim to use available resources responsibly, in alignment with our mission, and to communicate how they contribute to educational, scientific, and community initiatives.",
              "Մենք ձգտում ենք օգտագործել առկա ռեսուրսները պատասխանատու կերպով՝ մեր առաքելությանը համապատասխան, և հաղորդել, թե ինչպես են դրանք նպաստում կրթական, գիտական և համայնքային նախաձեռնություններին։"
            ]
          ],
          "media": "learning"
        }
      ]
    },
    {
      "id": "donate",
      "label": [
        "Support",
        "Աջակցել"
      ],
      "title": [
        "Help create opportunities\nfor others.",
        "Օգնեք հնարավորություններ\nստեղծել ուրիշների համար։"
      ],
      "intro": [
        "Individuals and organizations can support SemiTec through expertise, equipment, infrastructure, sponsorship, or financial assistance when suitable arrangements are available.",
        "Անհատներն ու կազմակերպությունները կարող են աջակցել SemiTec-ին փորձառությամբ, սարքավորումներով, ենթակառուցվածքով, հովանավորությամբ կամ ֆինանսական օգնությամբ, երբ համապատասխան պայմանավորվածությունները հասանելի լինեն։"
      ],
      "text": [
        [
          "We aim to ensure contributions support clearly defined initiatives and are managed responsibly.",
          "Մենք ձգտում ենք, որ ներդրումները աջակցեն հստակ սահմանված նախաձեռնություններին և կառավարվեն պատասխանատու կերպով։"
        ]
      ],
      "items": [
        [
          "Expertise and time",
          "Փորձառություն և ժամանակ"
        ],
        [
          "Equipment and infrastructure",
          "Սարքավորում և ենթակառուցվածք"
        ],
        [
          "Sponsorship",
          "Հովանավորություն"
        ],
        [
          "Financial support",
          "Ֆինանսական աջակցություն"
        ]
      ],
      "media": "learning",
      "children": [
        {
          "id": "expertise",
          "title": [
            "Expertise and time",
            "Փորձառություն և ժամանակ"
          ],
          "intro": [
            "Share knowledge, mentor, or help at events.",
            "Կիսվեք գիտելիքով, դարձեք մենթոր կամ օգնեք միջոցառումներին։"
          ],
          "items": [],
          "children": [],
          "media": "learning"
        },
        {
          "id": "equipment",
          "title": [
            "Equipment and infrastructure",
            "Սարքավորում և ենթակառուցվածք"
          ],
          "intro": [
            "Boards, instruments, computers, or space for learning and research.",
            "Տախտակներ, սարքեր, համակարգիչներ կամ տարածք՝ ուսման և հետազոտության համար։"
          ],
          "items": [],
          "children": [],
          "media": "learning"
        },
        {
          "id": "sponsorship",
          "title": [
            "Sponsorship",
            "Հովանավորություն"
          ],
          "intro": [
            "Support a clearly defined initiative or event.",
            "Աջակցեք հստակ սահմանված նախաձեռնության կամ միջոցառման։"
          ],
          "items": [],
          "children": [],
          "media": "learning"
        },
        {
          "id": "financial",
          "title": [
            "Financial support",
            "Ֆինանսական աջակցություն"
          ],
          "intro": [
            "Financial contributions will open when suitable arrangements are in place.",
            "Ֆինանսական ներդրումները հասանելի կլինեն, երբ համապատասխան պայմանավորվածությունները ձևավորվեն։"
          ],
          "items": [],
          "children": [],
          "media": "learning"
        }
      ]
    },
    {
      "id": "support",
      "label": [
        "Get Involved",
        "Միացեք"
      ],
      "title": [
        "Your knowledge, experience,\nand ideas can make a difference.",
        "Ձեր գիտելիքը, փորձը և\nգաղափարները կարող են փոփոխություն բերել։"
      ],
      "intro": [
        "The development of a strong semiconductor ecosystem requires people and organizations with different backgrounds, skills, and perspectives.",
        "Ուժեղ կիսահաղորդչային էկոհամակարգի զարգացումը պահանջում է տարբեր նախապատմություն, հմտություններ և տեսակետներ ունեցող մարդկանց և կազմակերպությունների։"
      ],
      "text": [
        [
          "Whether you are a student, researcher, engineer, educator, organization, or someone who shares our vision, there are opportunities to contribute. Meaningful technological progress is a collective effort.",
          "Անկախ նրանից՝ դուք ուսանող եք, հետազոտող, ինժեներ, դասախոս, կազմակերպություն, թե պարզապես կիսում եք մեր տեսլականը, ներդրում ունենալու հնարավորություններ կան։ Իմաստալից տեխնոլոգիական առաջընթացը համատեղ ջանքի արդյունք է։"
        ]
      ],
      "items": [
        [
          "Students",
          "Ուսանողներ"
        ],
        [
          "Professionals",
          "Մասնագետներ"
        ],
        [
          "Researchers & educators",
          "Հետազոտողներ և դասախոսներ"
        ],
        [
          "Institutions & companies",
          "Հաստատություններ և ընկերություններ"
        ],
        [
          "Volunteers",
          "Կամավորներ"
        ],
        [
          "Propose an idea",
          "Առաջարկեք գաղափար"
        ]
      ],
      "media": "gathering",
      "children": [
        {
          "id": "students",
          "title": [
            "For students",
            "Ուսանողների համար"
          ],
          "intro": [
            "Learn, explore, and discover opportunities.",
            "Սովորեք, որոնեք և բացահայտեք հնարավորություններ։"
          ],
          "items": [],
          "children": [],
          "text": [
            [
              "Students can express interest in educational activities, technical workshops, research projects, community events, and volunteering opportunities. We aim to encourage active learning and help students connect academic knowledge with practical experience.",
              "Ուսանողները կարող են հետաքրքրություն հայտնել կրթական գործողությունների, տեխնիկական սեմինարների, հետազոտական նախագծերի, համայնքային միջոցառումների և կամավորական հնարավորությունների նկատմամբ։ Մենք ձգտում ենք խրախուսել ակտիվ ուսումը և օգնել ուսանողներին կապել ակադեմիական գիտելիքը գործնական փորձի հետ։"
            ]
          ],
          "media": "gathering",
          "links": [
            {
              "label": [
                "Start learning with SemiTec Academy",
                "Սկսեք սովորել SemiTec Ակադեմիայով"
              ],
              "href": "https://github.com/SemiTecFoundation/semitec-academy/releases/latest"
            }
          ]
        },
        {
          "id": "professionals",
          "title": [
            "For engineers and industry professionals",
            "Ինժեներների և արդյունաբերության մասնագետների համար"
          ],
          "intro": [
            "Share your experience. Inspire new ideas.",
            "Կիսվեք ձեր փորձով։ Ոգեշնչեք նոր գաղափարներ։"
          ],
          "items": [],
          "children": [],
          "text": [
            [
              "Industry professionals can contribute by sharing technical knowledge, participating in discussions, proposing engineering challenges, mentoring students, or supporting collaborative initiatives. Your experience can help connect education and research with real-world technological needs.",
              "Արդյունաբերության մասնագետները կարող են ներդրում ունենալ՝ կիսվելով տեխնիկական գիտելիքով, մասնակցելով քննարկումներին, առաջարկելով ինժեներական խնդիրներ, ուղղորդելով ուսանողներին կամ աջակցելով համատեղ նախաձեռնություններին։ Ձեր փորձը կարող է օգնել կապել կրթությունն ու հետազոտությունը իրական տեխնոլոգիական կարիքների հետ։"
            ]
          ],
          "media": "gathering"
        },
        {
          "id": "researchers",
          "title": [
            "For researchers and educators",
            "Հետազոտողների և դասախոսների համար"
          ],
          "intro": [
            "Connect scientific exploration with collaboration.",
            "Կապեք գիտական որոնումը համագործակցության հետ։"
          ],
          "items": [],
          "children": [],
          "text": [
            [
              "Researchers and educators are welcome to propose research topics, educational activities, technical seminars, and opportunities for cooperation. We seek to encourage scientific knowledge exchange and collaborative research.",
              "Հետազոտողներն ու դասախոսները կարող են առաջարկել հետազոտական թեմաներ, կրթական գործողություններ, տեխնիկական դասախոսություններ և համագործակցության հնարավորություններ։ Մենք ձգտում ենք խրախուսել գիտական գիտելիքի փոխանակումը և համատեղ հետազոտությունը։"
            ]
          ],
          "media": "gathering"
        },
        {
          "id": "partner",
          "title": [
            "For universities, companies and organizations",
            "Համալսարանների, ընկերությունների և կազմակերպությունների համար"
          ],
          "intro": [
            "Explore institutional cooperation and contribute to the development of the ecosystem.",
            "Քննարկեք հաստատությունների համագործակցությունը և նպաստեք էկոհամակարգի զարգացմանը։"
          ],
          "items": [],
          "children": [],
          "text": [
            [
              "Academic institutions can engage with SemiTec to discuss educational programs, research activities, knowledge-sharing initiatives, and community events.",
              "Ակադեմիական հաստատությունները կարող են SemiTec-ի հետ քննարկել կրթական ծրագրեր, հետազոտական աշխատանքներ, գիտելիքի փոխանակման նախաձեռնություններ և համայնքային միջոցառումներ։"
            ],
            [
              "Companies and organizations can support educational initiatives, share technical challenges, provide expertise, contribute equipment or resources, and take part in collaborative activities. We aim to build relationships based on shared objectives, practical contributions, and long-term value.",
              "Ընկերություններն ու կազմակերպությունները կարող են աջակցել կրթական նախաձեռնություններին, կիսվել տեխնիկական խնդիրներով, տրամադրել փորձառություն, սարքավորումներ կամ ռեսուրսներ և մասնակցել համատեղ գործողություններին։ Մենք ձգտում ենք կառուցել հարաբերություններ՝ հիմնված ընդհանուր նպատակների, գործնական ներդրման և երկարաժամկետ արժեքի վրա։"
            ]
          ],
          "media": "gathering",
          "links": [
            {
              "label": [
                "Use SemiTec Academy in your courses",
                "Օգտագործեք SemiTec Ակադեմիան ձեր դասընթացներում"
              ],
              "href": "https://semitecfoundation.github.io/semitec-academy/"
            },
            {
              "label": [
                "Publish your own materials",
                "Հրապարակեք ձեր նյութերը"
              ],
              "href": "https://github.com/SemiTecFoundation/semitec-academy-skills"
            }
          ]
        },
        {
          "id": "volunteer",
          "title": [
            "Volunteer with us",
            "Կամավորեք մեզ հետ"
          ],
          "intro": [
            "Contribute your time and skills.",
            "Տրամադրեք ձեր ժամանակն ու հմտությունները։"
          ],
          "items": [],
          "children": [],
          "text": [
            [
              "Volunteers can support event organization, educational materials, communication activities, technical initiatives, and other foundation activities. Contributions from technical and nontechnical backgrounds are welcome.",
              "Կամավորները կարող են աջակցել միջոցառումների կազմակերպմանը, կրթական նյութերին, հաղորդակցությանը, տեխնիկական նախաձեռնություններին և հիմնադրամի այլ գործողություններին։ Ողջունելի են ինչպես տեխնիկական, այնպես էլ ոչ տեխնիկական ոլորտների մասնագետների ներդրումները։"
            ]
          ],
          "media": "gathering"
        },
        {
          "id": "idea",
          "title": [
            "Propose an idea",
            "Առաջարկեք գաղափար"
          ],
          "intro": [
            "Every meaningful initiative begins with an idea.",
            "Յուրաքանչյուր իմաստալից նախաձեռնություն սկսվում է գաղափարից։"
          ],
          "items": [],
          "children": [],
          "text": [
            [
              "We welcome proposals for educational programs, research topics, technical discussions, collaborative projects, and other activities aligned with the foundation's mission. If you have identified a challenge, opportunity, or idea that could benefit the semiconductor community, we encourage you to share it.",
              "Մենք ողջունում ենք կրթական ծրագրերի, հետազոտական թեմաների, տեխնիկական քննարկումների, համատեղ նախագծերի և հիմնադրամի առաքելությանը համապատասխան այլ գործողությունների առաջարկներ։ Եթե դուք նկատել եք խնդիր, հնարավորություն կամ գաղափար, որը կարող է օգտակար լինել կիսահաղորդչային համայնքին, խնդրում ենք կիսվել։"
            ]
          ],
          "media": "gathering"
        },
        {
          "id": "contact",
          "title": [
            "Contact us",
            "Կապ մեզ հետ"
          ],
          "intro": [
            "Interested in learning more, contributing, or exploring a potential collaboration?",
            "Ցանկանո՞ւմ եք ավելին իմանալ, ներդրում ունենալ կամ քննարկել համագործակցության հնարավորություն։"
          ],
          "items": [],
          "children": [],
          "text": [
            [
              "Reach out to SemiTec Foundation and tell us about your interests, experience, or proposal. We look forward to connecting with people who share our commitment to technological development.",
              "Կապվեք SemiTec հիմնադրամի հետ և պատմեք ձեր հետաքրքրությունների, փորձի կամ առաջարկի մասին։ Մենք անհամբեր սպասում ենք կապ հաստատել այն մարդկանց հետ, ովքեր կիսում են մեր նվիրումը տեխնոլոգիական զարգացմանը։"
            ]
          ],
          "media": "gathering"
        }
      ]
    }
  ],
  "media": {
    "wafer": {
      "src": "assets/wafer.svg",
      "alt": [
        "Illustration of a semiconductor wafer and its circuits",
        "Կիսահաղորդչային թիթեղի և շղթաների պատկեր"
      ],
      "title": [
        "From ideas to discovery",
        "Գաղափարներից դեպի բացահայտում"
      ],
      "caption": [
        "Illustration · Add a project or lab image here",
        "Պատկեր · Այստեղ ավելացրեք նախագծի կամ լաբորատորիայի լուսանկար"
      ]
    },
    "learning": {
      "src": "assets/learning.svg",
      "alt": [
        "Illustration of a learning workspace and a chip diagram",
        "Ուսումնական աշխատավայրի և չիպի գծապատկեր"
      ],
      "title": [
        "A place to learn and build",
        "Սովորելու և ստեղծելու վայր"
      ],
      "caption": [
        "Illustration · Add a program photograph here",
        "Պատկեր · Այստեղ ավելացրեք ծրագրի լուսանկար"
      ]
    },
    "gathering": {
      "src": "assets/gathering.svg",
      "alt": [
        "Illustration of people sharing ideas at an event",
        "Միջոցառման ընթացքում գաղափարներ փոխանակող մարդկանց պատկեր"
      ],
      "title": [
        "Connections become experiences",
        "Կապերը վերածվում են փորձառությունների"
      ],
      "caption": [
        "Illustration · Add an event photograph here",
        "Պատկեր · Այստեղ ավելացրեք միջոցառման լուսանկար"
      ]
    },
    "academy-app": {
      "src": "assets/academy/app.jpg",
      "alt": [
        "SemiTec Academy dashboard with a course in progress, calendar and catalog",
        "SemiTec Ակադեմիայի վահանակը՝ ընթացիկ դասընթացով, օրացույցով և կատալոգով"
      ],
      "title": [
        "Academy app",
        "Ակադեմիա հավելված"
      ],
      "caption": [
        "App interface · example course data",
        "Հավելվածի միջերես · օրինակային դասընթացի տվյալներ"
      ]
    },
    "academy-training": {
      "src": "assets/academy/training.jpg",
      "alt": [
        "An interactive training in SemiTec Academy with contents, lesson text and a quiz",
        "Ինտերակտիվ դասընթաց SemiTec Ակադեմիայում՝ բովանդակությամբ, դասի տեքստով և թեստով"
      ],
      "title": [
        "Learning materials",
        "Ուսումնական նյութեր"
      ],
      "caption": [
        "App interface · example course data",
        "Հավելվածի միջերես · օրինակային դասընթացի տվյալներ"
      ]
    },
    "academy-lab": {
      "src": "assets/academy/lab.jpg",
      "alt": [
        "A lab in SemiTec Academy with steps, manual, source files and a check quiz",
        "Լաբորատոր աշխատանք SemiTec Ակադեմիայում՝ քայլերով, ձեռնարկով, աղբյուր ֆայլերով և ստուգման թեստով"
      ],
      "title": [
        "Academy Templates",
        "Ակադեմիայի ձևանմուշներ"
      ],
      "caption": [
        "App interface · example course data",
        "Հավելվածի միջերես · օրինակային դասընթացի տվյալներ"
      ]
    }
  },
  "ui": {
    "map": [
      "Explore sections",
      "Բաժիններ"
    ],
    "mapTitle": [
      "Find your connection.",
      "Գտեք ձեր կապը։"
    ],
    "mapIntro": [
      "Explore a section, or take a short loop through its details.",
      "Բացահայտեք բաժինը կամ անցեք դրա մանրամասների կարճ շրջապտույտով։"
    ],
    "close": [
      "Close",
      "Փակել"
    ],
    "language": [
      "Language",
      "Լեզու"
    ],
    "still": [
      "Still view",
      "Անշարժ տեսք"
    ],
    "motion": [
      "Motion view",
      "Շարժվող տեսք"
    ],
    "pause": [
      "Pause camera movement",
      "Դադարեցնել տեսախցիկի շարժումը"
    ],
    "resume": [
      "Resume camera movement",
      "Վերսկսել տեսախցիկի շարժումը"
    ],
    "skip": [
      "Skip to section content",
      "Անցնել բաժնի բովանդակությանը"
    ],
    "home": [
      "Main circuit",
      "Գլխավոր ուղի"
    ],
    "beginning": [
      "THE BEGINNING",
      "ՍԿԻԶԲԸ"
    ],
    "explore": [
      "Explore this section",
      "Բացահայտել այս բաժինը"
    ],
    "optional": [
      "OPTIONAL LOOPS",
      "ԼՐԱՑՈՒՑԻՉ ՈՒՂԻՆԵՐ"
    ],
    "enter": [
      "Enter the circuit",
      "Մուտք գործել"
    ],
    "next": [
      "Continue the journey",
      "Շարունակել ճանապարհը"
    ],
    "restart": [
      "Return to the beginning",
      "Վերադառնալ սկզբին"
    ],
    "back": [
      "Return to ",
      "Վերադառնալ՝ "
    ],
    "previous": [
      "Previous section",
      "Նախորդ բաժինը"
    ],
    "loop": [
      "EXPLORING A LOOP",
      "ԲԱՑԱՀԱՅՏՈՒՄ ԵՆՔ ՇՐՋԱՊՏՈՒՅՏԸ"
    ],
    "returning": [
      "RETURNING TO THE JUNCTION",
      "ՎԵՐԱԴԱՌՆՈՒՄ ԵՆՔ ՄԻԱՑՄԱՆ ԿԵՏԻՆ"
    ],
    "loopHint": [
      "Keep scrolling. This loop returns to its starting point.",
      "Շարունակեք ոլորել։ Այս ուղին վերադառնում է իր սկզբնակետին։"
    ],
    "mainHint": [
      "Scroll to continue · Click a side path to explore",
      "Ոլորեք՝ շարունակելու համար · Սեղմեք կողմնակի ուղուն՝ ուսումնասիրելու համար"
    ],
    "introHint": [
      "Scroll to follow the signal",
      "Ոլորեք՝ ազդանշանին հետևելու համար"
    ],
    "doneHint": [
      "End of the main journey · Scroll up to revisit",
      "Գլխավոր ուղու ավարտը · Ոլորեք վեր՝ վերադառնալու համար"
    ],
    "prototype": [
      "© SemiTec Foundation. All rights reserved.",
      "© SemiTec հիմնադրամ։ Բոլոր իրավունքները պաշտպանված են։"
    ],
    "inside": [
      "INSIDE SEMITEC",
      "ՍԵՄԻԹԵՔԻ ՆԵՐՍՈՒՄ"
    ],
    "loopProgress": [
      "LOOP PROGRESS",
      "ՇՐՋԱՊՏՈՒՅՏԻ ԸՆԹԱՑՔԸ"
    ],
    "viewImage": [
      "View image",
      "Դիտել պատկերը"
    ],
    "mainNav": [
      "Foundation sections",
      "Հիմնադրամի բաժիններ"
    ],
    "breadcrumb": [
      "Current location",
      "Ընթացիկ տեղը"
    ],
    "content": [
      "Section content",
      "Բաժնի բովանդակություն"
    ],
    "mapOpen": [
      "Open section",
      "Բացել բաժինը"
    ],
    "mediaType": [
      "VISUAL NOTE",
      "ՏԵՍՈՂԱԿԱՆ ՆՇՈՒՄ"
    ],
    "fallback": [
      "The 3D view is unavailable. All content is still accessible.",
      "3D տեսքը հասանելի չէ։ Բովանդակությունը հասանելի է։"
    ],
    "branchTitle": [
      "SIDE PATHS",
      "ԿՈՂՄՆԱԿԻ ՈՒՂԻՆԵՐ"
    ],
    "branchEnter": [
      "Enter side path: ",
      "Մտնել կողմնակի ուղի՝ "
    ],
    "contentFirst": [
      "Scroll through the introduction · More paths appear ahead",
      "Ոլորեք ներածությունը · Հաջորդ ուղիները կհայտնվեն առջևում"
    ],
    "modeGroup": [
      "View mode",
      "Դիտման ռեժիմ"
    ],
    "mode2d": [
      "Read",
      "Կարդալ"
    ],
    "mode3d": [
      "Travel",
      "Ճամփորդել"
    ],
    "mapCaption": [
      "FOUNDATION MAP",
      "ՀԻՄՆԱԴՐԱՄԻ ՔԱՐՏԵԶ"
    ],
    "mapFollow": [
      "Following the page",
      "Հետևում է էջին"
    ],
    "mapFree": [
      "Free view",
      "Ազատ դիտում"
    ],
    "mapRecenter": [
      "Follow page",
      "Հետևել էջին"
    ],
    "mapTop": [
      "Top",
      "Վերևից"
    ],
    "map3d": [
      "3D",
      "3D"
    ],
    "zoomIn": [
      "Zoom in",
      "Մեծացնել"
    ],
    "zoomOut": [
      "Zoom out",
      "Փոքրացնել"
    ],
    "expand": [
      "Full-screen map",
      "Քարտեզը ամբողջ էկրանով"
    ],
    "collapse": [
      "Close full-screen map",
      "Փակել ամբողջ էկրանով քարտեզը"
    ],
    "zoomHint": [
      "Hold Ctrl / ⌘ and scroll to zoom",
      "Պահեք Ctrl / ⌘ և ոլորեք՝ մեծացնելու համար"
    ],
    "mapHelp": [
      "Drag to move · Scroll or pinch to zoom · Click a block to open it",
      "Քաշեք՝ տեղաշարժելու · Ոլորեք կամ մատներով մեծացրեք · Սեղմեք բլոկին՝ բացելու"
    ],
    "travel3d": [
      "Travel this path in 3D",
      "Անցնել այս ուղով 3D-ում"
    ],
    "enter3d": [
      "Enter the 3D journey",
      "Մտնել 3D ճանապարհ"
    ],
    "scrollBegin": [
      "Scroll to begin",
      "Ոլորեք՝ սկսելու համար"
    ],
    "pathsLabel": [
      "PATHS IN THIS SECTION",
      "ԱՅՍ ԲԱԺՆԻ ՈՒՂԻՆԵՐԸ"
    ],
    "further": [
      "Further paths",
      "Հետագա ուղիներ"
    ],
    "powerUnit": [
      "POWER UNIT",
      "ՍՆՈՒՑՄԱՆ ՀԱՆԳՈՒՅՑ"
    ],
    "giveOnce": [
      "Pulse · give once",
      "Իմպուլս · միանվագ"
    ],
    "giveMonthly": [
      "Clock · give monthly",
      "Տակտ · ամսական"
    ],
    "amountTbc": [
      "Amount to be confirmed",
      "Գումարը կհաստատվի"
    ],
    "donateSoon": [
      "Payment link coming soon",
      "Վճարման հղումը շուտով"
    ],
    "whereGoes": [
      "Where the support goes",
      "Ուր է գնում աջակցությունը"
    ],
    "powerOn": [
      "Every block runs on support",
      "Յուրաքանչյուր բլոկ աշխատում է աջակցությամբ"
    ],
    "partnerKind": [
      "PARTNER",
      "ԳՈՐԾԸՆԿԵՐ"
    ],
    "joinShort": [
      "+ Join",
      "+ Միանալ"
    ],
    "partnersCol": [
      "Partners",
      "Գործընկերներ"
    ],
    "mapMinimize": [
      "Make the map smaller",
      "Փոքրացնել քարտեզը"
    ],
    "supportersTitle": [
      "Supporters",
      "Աջակիցներ"
    ],
    "supporterKind": [
      "SUPPORTER",
      "ԱՋԱԿԻՑ"
    ],
    "padsTitle": [
      "PARTNERS & SUPPORTERS",
      "ԳՈՐԾԸՆԿԵՐՆԵՐ ԵՎ ԱՋԱԿԻՑՆԵՐ"
    ],
    "padsIntro": [
      "The contacts on the edge of the chip are where SemiTec connects with the world. Each partner and supporter gets one.",
      "Չիպի եզրի կոնտակտներն այն տեղն են, որտեղ SemiTec-ը կապվում է աշխարհի հետ։ Յուրաքանչյուր գործընկեր և աջակից ստանում է մեկը։"
    ],
    "padsNote": [
      "Shown only with each partner’s permission.",
      "Ցուցադրվում է միայն յուրաքանչյուր գործընկերոջ համաձայնությամբ։"
    ],
    "openPartners": [
      "Partners section",
      "Գործընկերների բաժին"
    ],
    "visitSite": [
      "Visit website",
      "Այցելել կայք"
    ],
    "finaleTitle": [
      "The edge of the chip",
      "Չիպի եզրը"
    ],
    "contactTitle": [
      "CONTACT",
      "ԿԱՊ"
    ],
    "feedbackTitle": [
      "Send us a message",
      "Գրեք մեզ"
    ],
    "fName": [
      "Your name",
      "Ձեր անունը"
    ],
    "fEmail": [
      "Your email",
      "Ձեր էլ. փոստը"
    ],
    "fMessage": [
      "Message or feedback",
      "Հաղորդագրություն կամ կարծիք"
    ],
    "fSend": [
      "Sending will be connected later",
      "Ուղարկումը կմիացվի ավելի ուշ"
    ],
    "spaceHint": [
      "Space · next   Shift+Space · back",
      "Space · հաջորդը   Shift+Space · նախորդը"
    ],
    "upcomingTitle": [
      "UPCOMING · ON THE PATH",
      "ԱՌԱՋԻԿԱ · ՃԱՆԱՊԱՐՀԻՆ"
    ],
    "memoryTitle": [
      "MEMORY · GALLERY AND ARCHIVE",
      "ՀԻՇՈՂՈՒԹՅՈՒՆ · ՊԱՏԿԵՐԱՍՐԱՀ ԵՎ ԱՐԽԻՎ"
    ],
    "memoryIntro": [
      "When an event has passed, it is written into memory. Open a cell to see its photos and recap.",
      "Միջոցառումն ավարտվելուց հետո գրանցվում է հիշողության մեջ։ Բացեք բջիջը՝ լուսանկարներն ու ամփոփումը տեսնելու համար։"
    ],
    "memoryEmpty": [
      "Empty cell · waiting for the next event",
      "Դատարկ բջիջ · սպասում է հաջորդ միջոցառմանը"
    ],
    "openGallery": [
      "Open the gallery",
      "Բացել պատկերասրահը"
    ],
    "noUpcoming": [
      "No upcoming events yet",
      "Առաջիկա միջոցառումներ դեռ չկան"
    ],
    "stored": [
      "stored",
      "պահված"
    ],
    "exampleNote": [
      "Only confirmed activities are shown here.",
      "Այստեղ ցուցադրվում են միայն հաստատված գործողություններ։"
    ],
    "memoryView": [
      "Memory view",
      "Հիշողության տեսք"
    ],
    "sound": [
      "Sound",
      "Ձայն"
    ],
    "soundOn": [
      "Turn sound off",
      "Անջատել ձայնը"
    ],
    "soundOff": [
      "Turn sound on",
      "Միացնել ձայնը"
    ],
    "partnersKicker": [
      "Partners & supporters",
      "Գործընկերներ և աջակիցներ"
    ],
    "partnersTitle": [
      "Everyone connected to the chip",
      "Բոլոր նրանք, ովքեր միացած են չիպին"
    ],
    "partnersText": [
      "The chip turned over: its I/O side. Every partner and supporter is one of its contacts; the ones marked + are still free and one of them can be yours.",
      "Չիպը շրջված է՝ դեպի իր մուտք/ելքի կողմը։ Յուրաքանչյուր գործընկեր և աջակից դրա կոնտակտներից մեկն է․ + նշանով կոնտակտները դեռ ազատ են, և դրանցից մեկը կարող է ձերը լինել։"
    ],
    "glanceKicker": [
      "At a glance",
      "Ակնարկ"
    ],
    "glanceTitle": [
      "SemiTec in brief",
      "SemiTec-ը համառոտ"
    ],
    "nextEvent": [
      "Next event",
      "Հաջորդ միջոցառումը"
    ],
    "openSection": [
      "Open this section",
      "Բացել բաժինը"
    ],
    "connTitle": [
      "One signal through every section",
      "Մեկ ազդանշան բոլոր բաժիններով"
    ],
    "connPower": [
      "Support is the power unit along the bottom edge: its rails feed every block.",
      "Աջակցությունը սնուցման բլոկն է ներքևի եզրին․ նրա գծերը սնում են բոլոր բլոկները։"
    ],
    "padsCardTitle": [
      "The contacts on the edge",
      "Կոնտակտները եզրին"
    ],
    "storySkip": [
      "Skip the intro",
      "Բաց թողնել ներածությունը"
    ],
    "storyJourneyKicker": [
      "The journey",
      "Ճամփորդությունը"
    ],
    "storyJourneyTitle": [
      "Now travel through the chip.",
      "Իսկ հիմա ճամփորդեք չիպի միջով։"
    ],
    "storyStart": [
      "Start the journey",
      "Սկսել ճամփորդությունը"
    ],
    "storyStartNote": [
      "Or keep scrolling",
      "Կամ շարունակեք ոլորել"
    ],
    "endKicker": [
      "SemiTec Foundation · the package",
      "SemiTec հիմնադրամ · կորպուսը"
    ],
    "endTitle": [
      "Connect to the chip",
      "Միացեք չիպին"
    ],
    "endText": [
      "The chip is sealed in its package. Only its contacts are outside: take a free one as a partner or supporter, or write to us.",
      "Չիպը փակված է իր կորպուսում։ Դրսում միայն կոնտակտներն են․ վերցրեք ազատ կոնտակտ որպես գործընկեր կամ աջակից, կամ գրեք մեզ։"
    ],
    "endScroll": [
      "Keep scrolling to see who connects to the chip",
      "Շարունակեք ոլորել՝ տեսնելու, թե ով է միանում չիպին"
    ],
    "ecoKicker": [
      "The ecosystem",
      "Էկոհամակարգը"
    ],
    "ecoTitle": [
      "One chip, many connections",
      "Մեկ չիպ, բազմաթիվ կապեր"
    ],
    "ecoText": [
      "The ecosystem we aim to connect: universities, research institutions, industry, researchers, schools and the wider community.",
      "Էկոհամակարգը, որը մենք ձգտում ենք կապել՝ համալսարաններ, հետազոտական հաստատություններ, արդյունաբերություն, հետազոտողներ, դպրոցներ և լայն հանրություն։"
    ],
    "ecoFree": [
      "Your organisation",
      "Ձեր կազմակերպությունը"
    ],
    "ecoFreeNote": [
      "A free module · become a partner",
      "Ազատ մոդուլ · դարձեք գործընկեր"
    ],
    "ecoConnect": [
      "Connect",
      "Միանալ"
    ],
    "contactUs": [
      "Contact us",
      "Կապ մեզ հետ"
    ],
    "backTop": [
      "Back to the beginning",
      "Վերադառնալ սկիզբ"
    ],
    "freePad": [
      "FREE CONNECTOR",
      "ԱԶԱՏ ԿՈՆՏԱԿՏ"
    ],
    "freePartnerTitle": [
      "This contact is waiting for a partner",
      "Այս կոնտակտը սպասում է գործընկերոջ"
    ],
    "freeSupporterTitle": [
      "This contact is waiting for a supporter",
      "Այս կոնտակտը սպասում է աջակցի"
    ],
    "freeNote": [
      "Every partner and supporter gets a contact on the edge of the chip.",
      "Յուրաքանչյուր գործընկեր և աջակից ստանում է կոնտակտ չիպի եզրին։"
    ],
    "becomePartner": [
      "Become a partner",
      "Դառնալ գործընկեր"
    ],
    "becomeSupporter": [
      "Become a supporter",
      "Դառնալ աջակից"
    ],
    "freeLabel": [
      "Free",
      "Ազատ"
    ],
    "buildKicker": [
      "How SemiTec is built",
      "Ինչպես է կառուցված SemiTec-ը"
    ],
    "buildTitle": [
      "Building connections. Creating opportunities.",
      "Կառուցում ենք կապեր։ Ստեղծում ենք հնարավորություններ։"
    ],
    "buildScroll": [
      "Scroll or use the arrow keys to build the chip",
      "Ոլորեք կամ օգտագործեք սլաքները՝ չիպը կառուցելու համար"
    ],
    "build1": [
      "Sections",
      "Բաժիններ"
    ],
    "build2": [
      "Connections",
      "Կապեր"
    ],
    "build3": [
      "Partners & supporters",
      "Գործընկերներ և աջակիցներ"
    ],
    "build1Note": [
      "Every section of the foundation is a block on the chip.",
      "Հիմնադրամի յուրաքանչյուր բաժին չիպի վրա բլոկ է։"
    ],
    "build2Note": [
      "One signal runs through every section, powered by Support.",
      "Մեկ ազդանշան անցնում է բոլոր բաժիններով՝ Աջակցության սնուցմամբ։"
    ],
    "build3Note": [
      "Partners and supporters connect on the edge; the free contacts are waiting for you.",
      "Գործընկերներն ու աջակիցները միանում են եզրին․ ազատ կոնտակտները սպասում են ձեզ։"
    ],
    "chooseKicker": [
      "TWO WAYS TO EXPLORE",
      "ԲԱՑԱՀԱՅՏԵԼՈՒ ԵՐԿՈՒ ՃԱՆԱՊԱՐՀ"
    ],
    "chooseTitle": [
      "Read the page, or travel through the chip.",
      "Կարդացեք էջը կամ ճամփորդեք չիպի միջով։"
    ],
    "chooseRead": [
      "Scroll to read",
      "Ոլորեք՝ կարդալու համար"
    ],
    "chooseReadNote": [
      "The map moves aside and follows you, section by section.",
      "Քարտեզը տեղաշարժվում է և հետևում է ձեզ՝ բաժին առ բաժին։"
    ],
    "choose3dNote": [
      "Travel along the signal, through the chip.",
      "Ճամփորդեք ազդանշանի հետ՝ չիպի միջով։"
    ],
    "footerLine": [
      "Advancing Armenia's semiconductor future through education, research, collaboration, and community.",
      "Զարգացնելով Հայաստանի կիսահաղորդչային ապագան կրթության, հետազոտության, համագործակցության և համայնքի միջոցով։"
    ],
    "noProjects": [
      "Nothing published yet: entries appear here as activities are completed.",
      "Դեռ ոչինչ չի հրապարակվել․ գրառումները կհայտնվեն այստեղ՝ գործողությունների ավարտին զուգընթաց։"
    ],
    "fOrg": [
      "Organization or university (optional)",
      "Կազմակերպություն կամ համալսարան (ըստ ցանկության)"
    ],
    "fCategory": [
      "I am a…",
      "Ես…"
    ],
    "fArea": [
      "Area of interest",
      "Հետաքրքրության ոլորտ"
    ],
    "fConsent": [
      "I agree that my data is used to answer this message.",
      "Համաձայն եմ, որ իմ տվյալներն օգտագործվեն այս հաղորդագրությանը պատասխանելու համար։"
    ],
    "formUnavailable": [
      "The form cannot send messages yet. Until it does, please use the contact details.",
      "Ձևը դեռ չի կարող հաղորդագրություններ ուղարկել։ Մինչ այդ օգտվեք կոնտակտային տվյալներից։"
    ],
    "academyLink": [
      "Academy ↗",
      "Ակադեմիա ↗"
    ],
    "academyHref": [
      "https://semitecfoundation.github.io/semitec-academy/",
      "https://semitecfoundation.github.io/semitec-academy/"
    ]
  },
  "partners": [],
  "story": {
    "brief": [
      "To strengthen Armenia's semiconductor ecosystem by connecting education, research, industry, and community.",
      "Ամրապնդել Հայաստանի կիսահաղորդչային էկոհամակարգը՝ կապելով կրթությունը, հետազոտությունը, արդյունաբերությունը և համայնքը։"
    ],
    "directions": [
      {
        "title": [
          "Education",
          "Կրթություն"
        ],
        "text": [
          "Empowering the next generation",
          "Աջակցում ենք նոր սերնդին"
        ]
      },
      {
        "title": [
          "Research",
          "Հետազոտություն"
        ],
        "text": [
          "From curiosity to solutions",
          "Հետաքրքրասիրությունից՝ լուծումներ"
        ]
      },
      {
        "title": [
          "Collaboration",
          "Համագործակցություն"
        ],
        "text": [
          "Knowledge meets real challenges",
          "Գիտելիքը՝ իրական խնդիրների հետ"
        ]
      },
      {
        "title": [
          "Community",
          "Համայնք"
        ],
        "text": [
          "A connected, engaged community",
          "Փոխկապակցված և ներգրավված համայնք"
        ]
      }
    ],
    "vision": [
      "Inspired by the four peaks of Mount Aragats.",
      "Ոգեշնչված Արագածի չորս գագաթներով։"
    ]
  },
  "ecosystem": [
    {
      "id": "universities",
      "title": [
        "Universities",
        "Համալսարաններ"
      ],
      "note": [
        "Courses, labs, joint programs",
        "Դասընթացներ, լաբորատորիաներ, համատեղ ծրագրեր"
      ],
      "color": "gold",
      "path": "support/partner"
    },
    {
      "id": "institutes",
      "title": [
        "Research institutes",
        "Գիտական ինստիտուտներ"
      ],
      "note": [
        "Shared projects and equipment",
        "Համատեղ նախագծեր և սարքավորումներ"
      ],
      "color": "teal",
      "path": "support/partner"
    },
    {
      "id": "researchers",
      "title": [
        "Researchers & mentors",
        "Հետազոտողներ և մենթորներ"
      ],
      "note": [
        "Supervision, talks, reviews",
        "Ղեկավարում, դասախոսություններ, գրախոսում"
      ],
      "color": "teal",
      "path": "support/partner"
    },
    {
      "id": "schools",
      "title": [
        "Schools & students",
        "Դպրոցներ և ուսանողներ"
      ],
      "note": [
        "Clubs, olympiads, first projects",
        "Խմբակներ, օլիմպիադաներ, առաջին նախագծեր"
      ],
      "color": "gold",
      "path": "support/partner"
    },
    {
      "id": "industry",
      "title": [
        "Industry companies",
        "Արդյունաբերական ընկերություններ"
      ],
      "note": [
        "Internships, real tasks, hiring",
        "Պրակտիկա, իրական խնդիրներ, աշխատանք"
      ],
      "color": "copper",
      "path": "support/partner"
    },
    {
      "id": "startups",
      "title": [
        "Startups",
        "Սթարթափներ"
      ],
      "note": [
        "Prototypes and pilots",
        "Նախատիպեր և փորձնական ծրագրեր"
      ],
      "color": "copper",
      "path": "support/partner"
    },
    {
      "id": "public",
      "title": [
        "Government & public bodies",
        "Պետական և հանրային կառույցներ"
      ],
      "note": [
        "Policy, standards, programs",
        "Քաղաքականություն, ստանդարտներ, ծրագրեր"
      ],
      "color": "teal",
      "path": "support/partner"
    },
    {
      "id": "international",
      "title": [
        "International & diaspora",
        "Միջազգային և սփյուռք"
      ],
      "note": [
        "Partners, experts, exchange",
        "Գործընկերներ, փորձագետներ, փոխանակում"
      ],
      "color": "gold",
      "path": "support/partner"
    }
  ],
  "contact": {
    "rows": [
      {
        "label": [
          "Email",
          "Էլ. փոստ"
        ],
        "value": [
          "To be added",
          "Կավելացվի"
        ],
        "href": ""
      },
      {
        "label": [
          "Phone",
          "Հեռախոս"
        ],
        "value": [
          "To be added",
          "Կավելացվի"
        ],
        "href": ""
      },
      {
        "label": [
          "Address",
          "Հասցե"
        ],
        "value": [
          "To be added",
          "Կավելացվի"
        ],
        "href": ""
      },
      {
        "label": [
          "Social media",
          "Սոցիալական ցանցեր"
        ],
        "value": [
          "To be added",
          "Կավելացվի"
        ],
        "href": ""
      }
    ]
  },
  "events": [],
  "memoryBanks": [
    {
      "id": "gallery",
      "section": "events",
      "source": "events",
      "color": "gold",
      "title": [
        "Gallery",
        "Պատկերասրահ"
      ],
      "open": [
        "Open the gallery",
        "Բացել պատկերասրահը"
      ],
      "intro": [
        "When an event has passed, it is written into memory. Open a cell to see its photos and recap.",
        "Միջոցառումն ավարտվելուց հետո գրանցվում է հիշողության մեջ։ Բացեք բջիջը՝ լուսանկարներն ու ամփոփումը տեսնելու համար։"
      ]
    },
    {
      "id": "projects",
      "section": "impact",
      "color": "teal",
      "title": [
        "Project archive",
        "Նախագծերի արխիվ"
      ],
      "open": [
        "Open the project archive",
        "Բացել նախագծերի արխիվը"
      ],
      "intro": [
        "Completed projects and milestones, each stored at the month it was finished.",
        "Ավարտված նախագծերն ու հանգրվանները՝ պահված ավարտի ամսով։"
      ]
    },
    {
      "id": "reports",
      "section": "transparency",
      "color": "copper",
      "title": [
        "Reports archive",
        "Հաշվետվությունների արխիվ"
      ],
      "open": [
        "Open the reports archive",
        "Բացել հաշվետվությունների արխիվը"
      ],
      "intro": [
        "Annual reports, financial statements and updates, stored by publication date.",
        "Տարեկան հաշվետվություններ, ֆինանսական ամփոփագրեր և թարմացումներ՝ ըստ հրապարակման ամսաթվի։"
      ]
    }
  ],
  "memory": [],
  "formCategories": [
    [
      "Student",
      "Ուսանող"
    ],
    [
      "Engineer / industry professional",
      "Ինժեներ / արդյունաբերության մասնագետ"
    ],
    [
      "Researcher / educator",
      "Հետազոտող / դասախոս"
    ],
    [
      "University / research institution",
      "Համալսարան / հետազոտական հաստատություն"
    ],
    [
      "Company / organization",
      "Ընկերություն / կազմակերպություն"
    ],
    [
      "Volunteer",
      "Կամավոր"
    ],
    [
      "Supporter",
      "Աջակից"
    ],
    [
      "Other",
      "Այլ"
    ]
  ]
};

/* ---------------------------------------------------------------------------
   Chip map (2D reading page). The floorplan is GENERATED from the sections
   above, so adding or removing a section or submenu never makes blocks overlap.
   - every main section except the overview becomes an equal tile
     (two rows; the second row is read right-to-left so the bus snakes)
   - the section named in `power` becomes the power unit along the bottom edge
   - submenus appear as cells inside their tile ("+n" = nested paths)
   Sizes are in chip units; the die is width × height.
   --------------------------------------------------------------------------- */
const CHIP_LAYOUT = {
  width: 1000, height: 760,
  columns: 4,            // tiles per row
  power: 'donate',       // section shown as the power unit ('' for none)
  margin: 40,            // space between die edge and tiles
  gap: 28,               // space between tiles in a row
  busGap: 86,            // space between the two rows (the signal bus runs here)
  powerHeight: 104       // height of the power unit
};
