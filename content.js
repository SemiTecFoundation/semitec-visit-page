/* EDIT CONTENT HERE. See EDITING.md for the schema and examples. */
/* Events: each has a date (YYYY-MM-DD). Upcoming events glow on the 3D path at Events;
   once the date has passed, the event is "written" into the Events memory bank (the gallery).
   Memory banks: one per section (memoryBanks). Items in `memory` name their bank and appear
   once their date has passed — projects in Impact, reports in Trust.
   Ecosystem: the modules that connect to the chip package at the end of the 2D page.
   All events and memory items below are placeholders: replace or delete them. */
const SITE_CONTENT = {
  "brand": {
    "name": "SemiTec",
    "subtitle": [
      "FOUNDATION",
      "ՀԻՄՆԱԴՐԱՄ"
    ],
    "tagline": [
      "A WORLD OF CONNECTIONS",
      "ԿԱՊԵՐԻ ԱՇԽԱՐՀ"
    ]
  },
  "sections": [
    {
      "id": "overview",
      "label": [
        "Overview",
        "Ընդհանուր տեսք"
      ],
      "title": [
        "Follow a spark.\nDiscover SemiTec.",
        "Հետևեք կայծին։\nԲացահայտեք Սեմիթեքը։"
      ],
      "intro": [
        "A journey through the people, ideas and work of SemiTec Foundation.",
        "Ճանապարհորդություն Սեմիթեք հիմնադրամի մարդկանց, գաղափարների և աշխատանքի միջով։"
      ],
      "items": [
        [
          "Education",
          "Կրթություն"
        ],
        [
          "Science",
          "Գիտություն"
        ],
        [
          "Technology",
          "Տեխնոլոգիա"
        ]
      ],
      "media": "wafer",
      "children": []
    },
    {
      "id": "purpose",
      "label": [
        "Purpose",
        "Նպատակ"
      ],
      "title": [
        "Our purpose.",
        "Մեր նպատակը։"
      ],
      "intro": [
        "Our story, our mission and our vision.",
        "Մեր պատմությունը, առաքելությունը և տեսլականը։"
      ],
      "items": [
        [
          "Our mission",
          "Մեր առաքելությունը"
        ],
        [
          "Our vision",
          "Մեր տեսլականը"
        ]
      ],
      "media": "wafer",
      "children": [
        {
          "id": "mission",
          "title": [
            "Our mission",
            "Մեր առաքելությունը"
          ],
          "items": [
            [
              "Our mission goes here",
              "Մեր առաքելությունը՝ այստեղ"
            ],
            [
              "Who we serve",
              "Ում համար ենք աշխատում"
            ],
            [
              "Why the foundation exists",
              "Ինչու է ստեղծվել հիմնադրամը"
            ]
          ],
          "children": [],
          "media": "wafer",
          "intro": [
            "Information for this destination goes here.",
            "Այս նպատակակետի տեղեկությունները՝ այստեղ։"
          ]
        },
        {
          "id": "vision",
          "title": [
            "Our vision",
            "Մեր տեսլականը"
          ],
          "items": [
            [
              "The future we want to build",
              "Ապագան, որը ցանկանում ենք կառուցել"
            ],
            [
              "Our long-term goals",
              "Մեր երկարաժամկետ նպատակները"
            ]
          ],
          "children": [],
          "media": "wafer",
          "intro": [
            "Information for this destination goes here.",
            "Այս նպատակակետի տեղեկությունները՝ այստեղ։"
          ]
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
        "Ideas into action.",
        "Գաղափարից՝ գործ։"
      ],
      "intro": [
        "Our aims and the four directions of our work.",
        "Մեր նպատակները և աշխատանքի չորս ուղղությունները։"
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
          "Industry",
          "Արդյունաբերություն"
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
            "Education",
            "Կրթություն"
          ],
          "items": [
            [
              "Our educational aims",
              "Մեր կրթական նպատակները"
            ],
            [
              "Learning opportunities",
              "Ուսուցման հնարավորություններ"
            ]
          ],
          "children": [],
          "media": "learning",
          "intro": [
            "Information for this destination goes here.",
            "Այս նպատակակետի տեղեկությունները՝ այստեղ։"
          ]
        },
        {
          "id": "research",
          "title": [
            "Research",
            "Հետազոտություն"
          ],
          "items": [
            [
              "Research directions",
              "Հետազոտական ուղղություններ"
            ],
            [
              "Labs and collaborations",
              "Լաբորատորիաներ և համագործակցություն"
            ]
          ],
          "children": [],
          "media": "learning",
          "intro": [
            "Information for this destination goes here.",
            "Այս նպատակակետի տեղեկությունները՝ այստեղ։"
          ]
        },
        {
          "id": "industry",
          "title": [
            "Industry",
            "Արդյունաբերություն"
          ],
          "items": [
            [
              "Industry connections",
              "Կապեր արդյունաբերության հետ"
            ],
            [
              "Applied projects",
              "Կիրառական նախագծեր"
            ]
          ],
          "children": [],
          "media": "learning",
          "intro": [
            "Information for this destination goes here.",
            "Այս նպատակակետի տեղեկությունները՝ այստեղ։"
          ]
        },
        {
          "id": "community",
          "title": [
            "Community",
            "Համայնք"
          ],
          "items": [
            [
              "Students and engineers",
              "Ուսանողներ և ինժեներներ"
            ],
            [
              "Researchers and professors",
              "Հետազոտողներ և դասախոսներ"
            ]
          ],
          "children": [],
          "media": "learning",
          "intro": [
            "Information for this destination goes here.",
            "Այս նպատակակետի տեղեկությունները՝ այստեղ։"
          ]
        }
      ]
    },
    {
      "id": "initiatives",
      "label": [
        "Initiatives",
        "Նախաձեռնություններ"
      ],
      "title": [
        "Our initiatives.",
        "Մեր նախաձեռնությունները։"
      ],
      "intro": [
        "Our platforms, programs and learning resources.",
        "Մեր հարթակները, ծրագրերը և ուսումնական նյութերը։"
      ],
      "items": [
        [
          "SemiTec Academy",
          "SemiTec Academy"
        ],
        [
          "Community platform",
          "Համայնքային հարթակ"
        ],
        [
          "Learning resources",
          "Ուսումնական նյութեր"
        ]
      ],
      "media": "learning",
      "children": [
        {
          "id": "academy",
          "title": [
            "SemiTec Academy",
            "SemiTec Academy"
          ],
          "items": [
            [
              "Who the Academy serves",
              "Ում համար է Ակադեմիան"
            ],
            [
              "Learning formats and topics",
              "Ուսուցման ձևաչափեր և թեմաներ"
            ],
            [
              "An Academy photo or project example",
              "Ակադեմիայի լուսանկար կամ նախագծի օրինակ"
            ]
          ],
          "children": [
            {
              "id": "programs",
              "title": [
                "Programs",
                "Ծրագրեր"
              ],
              "items": [
                [
                  "Program examples",
                  "Ծրագրերի օրինակներ"
                ],
                [
                  "Who can participate",
                  "Ով կարող է մասնակցել"
                ]
              ],
              "children": [],
              "media": "learning",
              "intro": [
                "Information for this destination goes here.",
                "Այս նպատակակետի տեղեկությունները՝ այստեղ։"
              ]
            },
            {
              "id": "resources",
              "title": [
                "Learning resources",
                "Ուսումնական նյութեր"
              ],
              "items": [
                [
                  "Materials and courses",
                  "Նյութեր և դասընթացներ"
                ],
                [
                  "Resource links go here",
                  "Նյութերի հղումները՝ այստեղ"
                ]
              ],
              "children": [],
              "media": "learning",
              "intro": [
                "Information for this destination goes here.",
                "Այս նպատակակետի տեղեկությունները՝ այստեղ։"
              ]
            }
          ],
          "media": "learning",
          "intro": [
            "Introduce SemiTec Academy and its learning approach here.",
            "Այստեղ ներկայացրեք SemiTec Academy-ն և ուսուցման մոտեցումը։"
          ],
          "branchAfter": 0.24
        },
        {
          "id": "platform",
          "title": [
            "Community platform",
            "Համայնքային հարթակ"
          ],
          "items": [
            [
              "Platform introduction",
              "Հարթակի ներկայացում"
            ],
            [
              "Who it connects",
              "Ում է միավորում"
            ],
            [
              "Development status",
              "Մշակման կարգավիճակ"
            ]
          ],
          "children": [],
          "media": "learning",
          "intro": [
            "Information for this destination goes here.",
            "Այս նպատակակետի տեղեկությունները՝ այստեղ։"
          ]
        },
        {
          "id": "resources",
          "title": [
            "Open resources",
            "Բաց նյութեր"
          ],
          "items": [
            [
              "Resource collections",
              "Նյութերի հավաքածուներ"
            ],
            [
              "Access and contribution",
              "Հասանելիություն և ներդրում"
            ]
          ],
          "children": [],
          "media": "learning",
          "intro": [
            "Information for this destination goes here.",
            "Այս նպատակակետի տեղեկությունները՝ այստեղ։"
          ]
        }
      ]
    },
    {
      "id": "events",
      "label": [
        "Events",
        "Միջոցառումներ"
      ],
      "title": [
        "Meet. Connect.",
        "Հանդիպել։ Կապվել։"
      ],
      "intro": [
        "Upcoming gatherings, past events and shared experiences.",
        "Առաջիկա հանդիպումներ, անցած միջոցառումներ և ընդհանուր փորձառություններ։"
      ],
      "items": [
        [
          "Upcoming event example",
          "Առաջիկա միջոցառման օրինակ"
        ],
        [
          "Past event example",
          "Անցած միջոցառման օրինակ"
        ],
        [
          "Dates, photographs & recaps",
          "Ամսաթվեր, լուսանկարներ և ամփոփումներ"
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
          "items": [
            [
              "Introduce this collection",
              "Ներկայացրեք այս հավաքածուն"
            ],
            [
              "Highlights and an image example",
              "Կարևոր կետեր և պատկերի օրինակ"
            ]
          ],
          "children": [
            {
              "id": "workshop",
              "title": [
                "Workshop example",
                "Աշխատաժողովի օրինակ"
              ],
              "items": [
                [
                  "Event title and introduction",
                  "Միջոցառման անվանում և ներկայացում"
                ],
                [
                  "Date, venue and speakers",
                  "Ամսաթիվ, վայր և խոսնակներ"
                ],
                [
                  "Agenda and registration information",
                  "Օրակարգ և գրանցման տեղեկություն"
                ]
              ],
              "children": [],
              "media": "gathering",
              "intro": [
                "Information for this destination goes here.",
                "Այս նպատակակետի տեղեկությունները՝ այստեղ։"
              ]
            },
            {
              "id": "meetup",
              "title": [
                "Community meetup example",
                "Համայնքային հանդիպման օրինակ"
              ],
              "items": [
                [
                  "Meetup title and purpose",
                  "Հանդիպման անվանում և նպատակ"
                ],
                [
                  "Date and participants",
                  "Ամսաթիվ և մասնակիցներ"
                ],
                [
                  "How to join",
                  "Ինչպես միանալ"
                ]
              ],
              "children": [],
              "media": "gathering",
              "intro": [
                "Information for this destination goes here.",
                "Այս նպատակակետի տեղեկությունները՝ այստեղ։"
              ]
            }
          ],
          "media": "gathering",
          "intro": [
            "Explore the examples in this collection.",
            "Բացահայտեք այս հավաքածուի օրինակները։"
          ]
        },
        {
          "id": "past",
          "title": [
            "Past events",
            "Անցած միջոցառումներ"
          ],
          "items": [
            [
              "Introduce this collection",
              "Ներկայացրեք այս հավաքածուն"
            ],
            [
              "Highlights and an image example",
              "Կարևոր կետեր և պատկերի օրինակ"
            ]
          ],
          "children": [
            {
              "id": "event-one",
              "title": [
                "Past event example",
                "Անցած միջոցառման օրինակ"
              ],
              "items": [
                [
                  "Event summary",
                  "Միջոցառման ամփոփում"
                ],
                [
                  "Speakers and highlights",
                  "Խոսնակներ և կարևոր դրվագներ"
                ],
                [
                  "Photos and outcomes",
                  "Լուսանկարներ և արդյունքներ"
                ]
              ],
              "children": [],
              "media": "gathering",
              "intro": [
                "Information for this destination goes here.",
                "Այս նպատակակետի տեղեկությունները՝ այստեղ։"
              ]
            },
            {
              "id": "event-two",
              "title": [
                "Another event example",
                "Մեկ այլ միջոցառման օրինակ"
              ],
              "items": [
                [
                  "Event introduction",
                  "Միջոցառման ներկայացում"
                ],
                [
                  "What happened",
                  "Ինչ է տեղի ունեցել"
                ],
                [
                  "Related materials",
                  "Առնչվող նյութեր"
                ]
              ],
              "children": [],
              "media": "gathering",
              "intro": [
                "Information for this destination goes here.",
                "Այս նպատակակետի տեղեկությունները՝ այստեղ։"
              ]
            }
          ],
          "media": "gathering",
          "intro": [
            "Explore the examples in this collection.",
            "Բացահայտեք այս հավաքածուի օրինակները։"
          ]
        },
        {
          "id": "gallery",
          "title": [
            "Event gallery",
            "Միջոցառումների պատկերասրահ"
          ],
          "items": [
            [
              "Photo collection",
              "Լուսանկարների հավաքածու"
            ],
            [
              "Video or recording",
              "Տեսանյութ կամ ձայնագրություն"
            ],
            [
              "Captions and event links",
              "Նկարագրություններ և միջոցառումների հղումներ"
            ]
          ],
          "children": [],
          "media": "gathering",
          "intro": [
            "Information for this destination goes here.",
            "Այս նպատակակետի տեղեկությունները՝ այստեղ։"
          ]
        }
      ]
    },
    {
      "id": "impact",
      "label": [
        "Impact",
        "Արդյունքներ"
      ],
      "title": [
        "Work in action.",
        "Աշխատանքը՝ գործի մեջ։"
      ],
      "intro": [
        "Completed work, milestones and results.",
        "Ավարտված աշխատանքներ, հանգրվաններ և արդյունքներ։"
      ],
      "items": [
        [
          "Project or milestone",
          "Նախագիծ կամ հանգրվան"
        ],
        [
          "Story or collaboration",
          "Պատմություն կամ համագործակցություն"
        ],
        [
          "Result or publication",
          "Արդյունք կամ հրապարակում"
        ]
      ],
      "media": "wafer",
      "children": [
        {
          "id": "projects",
          "title": [
            "Completed work",
            "Ավարտված աշխատանքներ"
          ],
          "items": [
            [
              "Project example",
              "Նախագծի օրինակ"
            ],
            [
              "What was done",
              "Ինչ է արվել"
            ],
            [
              "Verified outcome",
              "Հաստատված արդյունք"
            ]
          ],
          "children": [],
          "media": "wafer",
          "intro": [
            "Information for this destination goes here.",
            "Այս նպատակակետի տեղեկությունները՝ այստեղ։"
          ]
        },
        {
          "id": "milestones",
          "title": [
            "Milestones",
            "Հանգրվաններ"
          ],
          "items": [
            [
              "Timeline of our work",
              "Մեր աշխատանքի ժամանակագրությունը"
            ],
            [
              "Key achievements",
              "Կարևոր ձեռքբերումներ"
            ]
          ],
          "children": [],
          "media": "wafer",
          "intro": [
            "Information for this destination goes here.",
            "Այս նպատակակետի տեղեկությունները՝ այստեղ։"
          ]
        },
        {
          "id": "stories",
          "title": [
            "Stories",
            "Պատմություններ"
          ],
          "items": [
            [
              "A collaboration story",
              "Համագործակցության պատմություն"
            ],
            [
              "People and outcomes",
              "Մարդիկ և արդյունքներ"
            ]
          ],
          "children": [],
          "media": "wafer",
          "intro": [
            "Information for this destination goes here.",
            "Այս նպատակակետի տեղեկությունները՝ այստեղ։"
          ]
        }
      ]
    },
    {
      "id": "people",
      "label": [
        "People",
        "Մարդիկ"
      ],
      "title": [
        "Better together.",
        "Միասին՝ ավելի ուժեղ։"
      ],
      "intro": [
        "Our team, trustees and partners.",
        "Մեր թիմը, հոգաբարձուները և գործընկերները։"
      ],
      "items": [
        [
          "Leadership & team",
          "Ղեկավարություն և թիմ"
        ],
        [
          "Board of trustees",
          "Հոգաբարձուների խորհուրդ"
        ],
        [
          "Partners & collaborators",
          "Գործընկերներ"
        ]
      ],
      "media": "gathering",
      "children": [
        {
          "id": "team",
          "title": [
            "Our team",
            "Մեր թիմը"
          ],
          "items": [
            [
              "Names and roles",
              "Անուններ և դերեր"
            ],
            [
              "Short introductions",
              "Կարճ ներկայացումներ"
            ]
          ],
          "children": [],
          "media": "gathering",
          "intro": [
            "Information for this destination goes here.",
            "Այս նպատակակետի տեղեկությունները՝ այստեղ։"
          ]
        },
        {
          "id": "trustees",
          "title": [
            "Trustees",
            "Հոգաբարձուներ"
          ],
          "items": [
            [
              "Board members",
              "Խորհրդի անդամներ"
            ],
            [
              "Governance roles",
              "Կառավարման դերեր"
            ]
          ],
          "children": [],
          "media": "gathering",
          "intro": [
            "Information for this destination goes here.",
            "Այս նպատակակետի տեղեկությունները՝ այստեղ։"
          ]
        },
        {
          "id": "partners",
          "title": [
            "Partners",
            "Գործընկերներ"
          ],
          "items": [
            [
              "Confirmed partners",
              "Հաստատված գործընկերներ"
            ],
            [
              "Our collaborations",
              "Մեր համագործակցությունները"
            ]
          ],
          "children": [],
          "media": "gathering",
          "intro": [
            "Information for this destination goes here.",
            "Այս նպատակակետի տեղեկությունները՝ այստեղ։"
          ]
        }
      ]
    },
    {
      "id": "transparency",
      "label": [
        "Trust",
        "Վստահություն"
      ],
      "title": [
        "Built on trust.",
        "Վստահության հիմքով։"
      ],
      "intro": [
        "Our charter, governance and reports.",
        "Մեր կանոնադրությունը, կառավարումը և հաշվետվությունները։"
      ],
      "items": [
        [
          "Foundation details",
          "Հիմնադրամի տվյալներ"
        ],
        [
          "Charter & governance",
          "Կանոնադրություն և կառավարում"
        ],
        [
          "Reports & updates",
          "Հաշվետվություններ և նորություններ"
        ]
      ],
      "media": "learning",
      "children": [
        {
          "id": "charter",
          "title": [
            "Charter",
            "Կանոնադրություն"
          ],
          "items": [
            [
              "Public charter document",
              "Հանրային կանոնադրության փաստաթուղթ"
            ],
            [
              "Foundation aims",
              "Հիմնադրամի նպատակները"
            ]
          ],
          "children": [],
          "media": "learning",
          "intro": [
            "Information for this destination goes here.",
            "Այս նպատակակետի տեղեկությունները՝ այստեղ։"
          ]
        },
        {
          "id": "governance",
          "title": [
            "Governance",
            "Կառավարում"
          ],
          "items": [
            [
              "How decisions are made",
              "Ինչպես են ընդունվում որոշումները"
            ],
            [
              "Foundation details",
              "Հիմնադրամի տվյալներ"
            ]
          ],
          "children": [],
          "media": "learning",
          "intro": [
            "Information for this destination goes here.",
            "Այս նպատակակետի տեղեկությունները՝ այստեղ։"
          ]
        },
        {
          "id": "reports",
          "title": [
            "Reports",
            "Հաշվետվություններ"
          ],
          "items": [
            [
              "Activity reports",
              "Գործունեության հաշվետվություններ"
            ],
            [
              "Financial reports",
              "Ֆինանսական հաշվետվություններ"
            ]
          ],
          "children": [],
          "media": "learning",
          "intro": [
            "Information for this destination goes here.",
            "Այս նպատակակետի տեղեկությունները՝ այստեղ։"
          ]
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
        "Power what comes next.",
        "Սնուցեք այն, ինչ գալիս է հետո։"
      ],
      "intro": [
        "Every block of this chip runs on support. Choose how you would like to power the work.",
        "Այս չիպի յուրաքանչյուր բլոկ աշխատում է աջակցության շնորհիվ։ Ընտրեք, թե ինչպես եք ցանկանում սնուցել աշխատանքը։"
      ],
      "items": [
        [
          "Give once or monthly",
          "Միանվագ կամ ամսական"
        ],
        [
          "See where support goes",
          "Տեսեք, ուր է գնում աջակցությունը"
        ],
        [
          "Payment options will be added",
          "Վճարման եղանակները կավելացվեն"
        ]
      ],
      "media": "learning",
      "children": [
        {
          "id": "pulse",
          "title": [
            "Give once · Pulse",
            "Միանվագ · Իմպուլս"
          ],
          "intro": [
            "A single gift that powers the work right now.",
            "Մեկանգամյա նվիրատվություն, որն այժմ է սնուցում աշխատանքը։"
          ],
          "items": [
            [
              "Amounts to be confirmed",
              "Գումարները կհաստատվեն"
            ],
            [
              "Secure payment link to be added",
              "Անվտանգ վճարման հղումը կավելացվի"
            ]
          ],
          "children": [],
          "media": "learning"
        },
        {
          "id": "clock",
          "title": [
            "Give monthly · Clock",
            "Ամսական · Տակտ"
          ],
          "intro": [
            "A steady monthly gift, like a clock signal that keeps the chip running.",
            "Կայուն ամսական աջակցություն՝ տակտային ազդանշանի պես, որը պահում է չիպի աշխատանքը։"
          ],
          "items": [
            [
              "Amounts to be confirmed",
              "Գումարները կհաստատվեն"
            ],
            [
              "Change or stop at any time",
              "Կարելի է փոխել կամ դադարեցնել ցանկացած պահի"
            ]
          ],
          "children": [],
          "media": "learning"
        },
        {
          "id": "lab-kit",
          "title": [
            "Fund a lab kit",
            "Ֆինանսավորել լաբորատոր հավաքածու"
          ],
          "intro": [
            "Equip one student for hands-on chip-design labs.",
            "Ապահովեք մեկ ուսանողի չիպերի նախագծման գործնական աշխատանքները։"
          ],
          "items": [
            [
              "What a kit contains goes here",
              "Հավաքածուի բովանդակությունը՝ այստեղ"
            ],
            [
              "Cost to be confirmed",
              "Արժեքը կհաստատվի"
            ]
          ],
          "children": [],
          "media": "learning"
        },
        {
          "id": "equipment",
          "title": [
            "Donate equipment",
            "Նվիրաբերել սարքավորում"
          ],
          "intro": [
            "Boards, instruments and computers for teaching labs.",
            "Սալիկներ, սարքեր և համակարգիչներ ուսումնական լաբորատորիաների համար։"
          ],
          "items": [
            [
              "Equipment we need goes here",
              "Անհրաժեշտ սարքավորումները՝ այստեղ"
            ],
            [
              "How to arrange a donation",
              "Ինչպես կազմակերպել նվիրատվությունը"
            ]
          ],
          "children": [],
          "media": "wafer"
        },
        {
          "id": "time",
          "title": [
            "Give your time",
            "Նվիրեք ձեր ժամանակը"
          ],
          "intro": [
            "Teach, mentor students or help at events.",
            "Դասավանդեք, ուղղորդեք ուսանողներին կամ օգնեք միջոցառումներում։"
          ],
          "items": [
            [
              "Guest lectures and mentoring",
              "Հրավիրյալ դասախոսություններ և ուղղորդում"
            ],
            [
              "Event volunteering",
              "Կամավորություն միջոցառումներում"
            ]
          ],
          "children": [],
          "media": "gathering"
        }
      ]
    },
    {
      "id": "support",
      "label": [
        "Connect",
        "Միանալ"
      ],
      "title": [
        "The next connection.",
        "Հաջորդ կապը։"
      ],
      "intro": [
        "Become a partner or get in touch. To support the work, see Support.",
        "Դառնալ գործընկեր կամ կապ հաստատել։ Աշխատանքին աջակցելու համար՝ տե՛ս «Աջակցել» բաժինը։"
      ],
      "items": [
        [
          "Become a partner",
          "Դառնալ գործընկեր"
        ],
        [
          "Contact us",
          "Կապ հաստատել"
        ]
      ],
      "media": "gathering",
      "children": [
        {
          "id": "partner",
          "title": [
            "Become a partner",
            "Դառնալ գործընկեր"
          ],
          "items": [
            [
              "Partnership opportunities",
              "Համագործակցության հնարավորություններ"
            ],
            [
              "How to start a conversation",
              "Ինչպես սկսել զրույցը"
            ]
          ],
          "children": [],
          "media": "gathering",
          "intro": [
            "Information for this destination goes here.",
            "Այս նպատակակետի տեղեկությունները՝ այստեղ։"
          ]
        },
        {
          "id": "contact",
          "title": [
            "Contact us",
            "Կապ հաստատել"
          ],
          "items": [
            [
              "Public email address",
              "Հանրային էլեկտրոնային հասցե"
            ],
            [
              "Social channels",
              "Սոցիալական հարթակներ"
            ]
          ],
          "children": [],
          "media": "gathering",
          "intro": [
            "Information for this destination goes here.",
            "Այս նպատակակետի տեղեկությունները՝ այստեղ։"
          ]
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
      "Design exploration · Example content",
      "Դիզայնի նախագիծ · Օրինակային բովանդակություն"
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
      "The gold contacts on the edge of the chip — where SemiTec connects with the world.",
      "Չիպի եզրի ոսկե կոնտակտները՝ այնտեղ, որտեղ Սեմիթեքը կապվում է աշխարհի հետ։"
    ],
    "padsNote": [
      "Placeholder names · shown only with each partner’s permission",
      "Անունները օրինակային են · ցուցադրվում են միայն համաձայնությամբ"
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
      "Examples · replace them in content.js",
      "Օրինակներ · փոխարինեք content.js-ում"
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
      "Universities, industry, researchers and schools connect to SemiTec, module by module.",
      "Համալսարանները, արդյունաբերությունը, հետազոտողները և դպրոցները միանում են SemiTec-ին՝ մոդուլ առ մոդուլ։"
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
      "Every part of the foundation is part of one chip.",
      "Հիմնադրամի յուրաքանչյուր մաս մեկ չիպի մասն է։"
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
    ]
  },
  "partners": [
    {
      "id": "university",
      "kind": "partner",
      "name": [
        "University partner",
        "Համալսարան գործընկեր"
      ],
      "url": ""
    },
    {
      "id": "industry",
      "kind": "partner",
      "name": [
        "Industry partner",
        "Արդյունաբերական գործընկեր"
      ],
      "url": ""
    },
    {
      "id": "research",
      "kind": "partner",
      "name": [
        "Research institute",
        "Գիտահետազոտական ինստիտուտ"
      ],
      "url": ""
    },
    {
      "id": "technology",
      "kind": "partner",
      "name": [
        "Technology company",
        "Տեխնոլոգիական ընկերություն"
      ],
      "url": ""
    },
    {
      "id": "education",
      "kind": "partner",
      "name": [
        "Education partner",
        "Կրթական գործընկեր"
      ],
      "url": ""
    },
    {
      "id": "community",
      "kind": "partner",
      "name": [
        "Community partner",
        "Համայնքային գործընկեր"
      ],
      "url": ""
    },
    {
      "id": "supporter-1",
      "kind": "supporter",
      "name": [
        "Supporter name",
        "Աջակցի անուն"
      ],
      "url": ""
    },
    {
      "id": "supporter-2",
      "kind": "supporter",
      "name": [
        "Supporter name",
        "Աջակցի անուն"
      ],
      "url": ""
    },
    {
      "id": "supporter-3",
      "kind": "supporter",
      "name": [
        "Supporter name",
        "Աջակցի անուն"
      ],
      "url": ""
    },
    {
      "id": "supporter-4",
      "kind": "supporter",
      "name": [
        "Supporter name",
        "Աջակցի անուն"
      ],
      "url": ""
    }
  ],
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
  "events": [
    {
      "id": "open-lab-2026",
      "date": "2026-02-14",
      "title": [
        "Open lab day (example)",
        "Բաց լաբորատորիայի օր (օրինակ)"
      ],
      "place": [
        "Place to be added",
        "Վայրը կավելացվի"
      ],
      "recap": [
        "Recap, photos and participants go here.",
        "Ամփոփումը, լուսանկարները և մասնակիցները՝ այստեղ։"
      ],
      "media": "learning"
    },
    {
      "id": "student-meetup-2026",
      "date": "2026-04-18",
      "title": [
        "Student meetup (example)",
        "Ուսանողական հանդիպում (օրինակ)"
      ],
      "place": [
        "Place to be added",
        "Վայրը կավելացվի"
      ],
      "recap": [
        "Recap, photos and participants go here.",
        "Ամփոփումը, լուսանկարները և մասնակիցները՝ այստեղ։"
      ],
      "media": "gathering"
    },
    {
      "id": "fpga-workshop-2026",
      "date": "2026-06-06",
      "title": [
        "FPGA workshop (example)",
        "FPGA աշխատարան (օրինակ)"
      ],
      "place": [
        "Place to be added",
        "Վայրը կավելացվի"
      ],
      "recap": [
        "Recap, photos and participants go here.",
        "Ամփոփումը, լուսանկարները և մասնակիցները՝ այստեղ։"
      ],
      "media": "learning"
    },
    {
      "id": "summer-school-2026",
      "date": "2026-07-20",
      "title": [
        "Summer school (example)",
        "Ամառային դպրոց (օրինակ)"
      ],
      "place": [
        "Place to be added",
        "Վայրը կավելացվի"
      ],
      "recap": [
        "Recap, photos and participants go here.",
        "Ամփոփումը, լուսանկարները և մասնակիցները՝ այստեղ։"
      ],
      "media": "gathering"
    },
    {
      "id": "chip-talk-2026",
      "date": "2026-09-26",
      "title": [
        "Chip design talk (example)",
        "Դասախոսություն չիպերի նախագծման մասին (օրինակ)"
      ],
      "place": [
        "Place to be added",
        "Վայրը կավելացվի"
      ],
      "recap": [
        "Recap, photos and participants go here.",
        "Ամփոփումը, լուսանկարները և մասնակիցները՝ այստեղ։"
      ],
      "media": "wafer"
    },
    {
      "id": "rtl-workshop-2026",
      "date": "2026-11-14",
      "title": [
        "RTL workshop (example)",
        "RTL աշխատարան (օրինակ)"
      ],
      "place": [
        "Place to be added",
        "Վայրը կավելացվի"
      ],
      "recap": [
        "Recap, photos and participants go here.",
        "Ամփոփումը, լուսանկարները և մասնակիցները՝ այստեղ։"
      ],
      "media": "learning"
    },
    {
      "id": "demo-day-2026",
      "date": "2026-12-05",
      "title": [
        "Student demo day (example)",
        "Ուսանողական ցուցադրության օր (օրինակ)"
      ],
      "place": [
        "Place to be added",
        "Վայրը կավելացվի"
      ],
      "recap": [
        "Recap, photos and participants go here.",
        "Ամփոփումը, լուսանկարները և մասնակիցները՝ այստեղ։"
      ],
      "media": "gathering"
    },
    {
      "id": "partner-meetup-2027",
      "date": "2027-02-20",
      "title": [
        "Partner meetup (example)",
        "Գործընկերների հանդիպում (օրինակ)"
      ],
      "place": [
        "Place to be added",
        "Վայրը կավելացվի"
      ],
      "recap": [
        "Recap, photos and participants go here.",
        "Ամփոփումը, լուսանկարները և մասնակիցները՝ այստեղ։"
      ],
      "media": "gathering"
    }
  ],
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
  "memory": [
    {
      "id": "foundation-start",
      "bank": "projects",
      "date": "2025-09-15",
      "title": [
        "Foundation registered (example)",
        "Հիմնադրամի գրանցում (օրինակ)"
      ],
      "summary": [
        "A short summary and a link go here.",
        "Կարճ ամփոփումը և հղումը՝ այստեղ։"
      ],
      "media": "wafer",
      "url": ""
    },
    {
      "id": "fpga-lab",
      "bank": "projects",
      "date": "2025-12-10",
      "title": [
        "FPGA teaching lab equipped (example)",
        "FPGA ուսումնական լաբորատորիայի կահավորում (օրինակ)"
      ],
      "summary": [
        "A short summary and a link go here.",
        "Կարճ ամփոփումը և հղումը՝ այստեղ։"
      ],
      "media": "learning",
      "url": ""
    },
    {
      "id": "course-materials",
      "bank": "projects",
      "date": "2026-03-20",
      "title": [
        "Open course materials published (example)",
        "Բաց ուսումնական նյութերի հրապարակում (օրինակ)"
      ],
      "summary": [
        "A short summary and a link go here.",
        "Կարճ ամփոփումը և հղումը՝ այստեղ։"
      ],
      "media": "learning",
      "url": ""
    },
    {
      "id": "student-tapeout",
      "bank": "projects",
      "date": "2026-08-28",
      "title": [
        "First student chip design submitted (example)",
        "Ուսանողական առաջին չիպի նախագծի ներկայացում (օրինակ)"
      ],
      "summary": [
        "A short summary and a link go here.",
        "Կարճ ամփոփումը և հղումը՝ այստեղ։"
      ],
      "media": "wafer",
      "url": ""
    },
    {
      "id": "annual-2025",
      "bank": "reports",
      "date": "2026-03-31",
      "title": [
        "Annual report 2025 (example)",
        "Տարեկան հաշվետվություն 2025 (օրինակ)"
      ],
      "summary": [
        "A short summary and a link go here.",
        "Կարճ ամփոփումը և հղումը՝ այստեղ։"
      ],
      "media": "wafer",
      "url": ""
    },
    {
      "id": "financial-2025",
      "bank": "reports",
      "date": "2026-04-30",
      "title": [
        "Financial statement 2025 (example)",
        "Ֆինանսական ամփոփագիր 2025 (օրինակ)"
      ],
      "summary": [
        "A short summary and a link go here.",
        "Կարճ ամփոփումը և հղումը՝ այստեղ։"
      ],
      "media": "wafer",
      "url": ""
    },
    {
      "id": "update-q2-2026",
      "bank": "reports",
      "date": "2026-07-15",
      "title": [
        "Activity update, Q2 2026 (example)",
        "Գործունեության թարմացում, 2026 Q2 (օրինակ)"
      ],
      "summary": [
        "A short summary and a link go here.",
        "Կարճ ամփոփումը և հղումը՝ այստեղ։"
      ],
      "media": "learning",
      "url": ""
    }
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
