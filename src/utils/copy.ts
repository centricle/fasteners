// The words every page shares: what each kind of fastener is, the questions
// people ask about it, what the terms on a box mean, and the pairs people mix
// up. The ledes, descriptions and questions came verbatim from the five
// original category pages.

export interface Faq {
  q: string;
  a: string;
}

export interface CategoryCopy {
  title: string;
  description: string;
  /** What this kind of fastener does, in one sentence. */
  what: string;
  lede: string;
  faq: Faq[];
}

export const COPY: Record<string, CategoryCopy> = {
  "screws": {
    "title": "Screws",
    "description": "Comprehensive screw specifications - wood screws, machine screws, self-tapping, and specialty screws.",
    "what": "A screw threads straight into the material, or into a threaded hole, and is turned by its head.",
    "lede": "Wood screws, machine screws, self-tapping, and specialty screws.",
    "faq": [
      {
        "q": "What is the difference between wood screws and machine screws?",
        "a": "Wood screws have a tapered shank with coarse threads designed to cut into wood fibers. Machine screws have a uniform diameter with finer threads and require a pre-tapped hole or nut. Wood screws are self-tapping in wood; machine screws are used in metal, plastic, or other materials with matching threaded holes."
      },
      {
        "q": "What does the screw gauge number mean?",
        "a": "Screw gauge refers to the diameter of the screw shaft. Common gauges range from #2 (0.086\") to #14 (0.242\"). Higher numbers indicate larger diameters. For screws 1/4\" and above, the diameter is stated as a fraction rather than a gauge number."
      },
      {
        "q": "When should I use self-tapping vs self-drilling screws?",
        "a": "Self-tapping screws create their own threads in a pre-drilled pilot hole. Self-drilling screws have a drill-bit tip that eliminates the need for a pilot hole entirely. Use self-tapping screws in softer materials like wood or plastic. Use self-drilling screws for sheet metal or steel framing where drilling and fastening in one step saves time."
      },
      {
        "q": "What drive type is strongest: Phillips, Torx, or Robertson?",
        "a": "Robertson (square) and Torx (star) drives resist cam-out better than Phillips, allowing more torque transfer. Torx provides the highest torque capacity due to its six-lobe contact area. Phillips was intentionally designed to cam out at a set torque to prevent over-tightening, which is a disadvantage when maximum clamping force is needed."
      },
      {
        "q": "What screw material should I use outdoors?",
        "a": "Stainless steel (304 or 316) resists corrosion in most outdoor environments. For pressure-treated lumber, use screws rated ACQ-compatible — typically stainless steel or specially coated screws. Avoid plain steel or zinc-plated screws outdoors, as they corrode rapidly. Silicon bronze is preferred for marine applications."
      }
    ]
  },
  "bolts": {
    "title": "Bolts",
    "description": "Bolt specifications - hex bolts, carriage bolts, lag bolts, and structural fasteners.",
    "what": "A bolt passes through a hole and is clamped by a nut on the far side.",
    "lede": "Hex bolts, carriage bolts, lag bolts, and structural fasteners.",
    "faq": [
      {
        "q": "What is the difference between a bolt and a screw?",
        "a": "By general convention, a bolt passes through an unthreaded hole and is secured with a nut on the opposite side. A screw threads directly into a tapped hole or material. However, usage varies by industry — ASME defines the distinction based on how the fastener is tightened (by the nut vs by the head)."
      },
      {
        "q": "What do bolt grade markings mean?",
        "a": "Grade markings on bolt heads indicate tensile strength. Grade 2 (no marks) is standard low-carbon steel. Grade 5 (three radial lines) is medium-carbon quenched and tempered steel with 120,000 PSI tensile strength. Grade 8 (six radial lines) is high-strength alloy steel at 150,000 PSI. Metric bolts use a numerical system (e.g., 8.8, 10.9, 12.9)."
      },
      {
        "q": "When should I use a carriage bolt vs a hex bolt?",
        "a": "Carriage bolts have a smooth, dome-shaped head with a square shoulder beneath that locks into the wood to prevent spinning. They are used when a finished appearance is needed or when the bolt head should not be removable with a wrench. Hex bolts are tightened from the head side with a wrench and are used in structural and mechanical applications where higher torque is required."
      },
      {
        "q": "What is the difference between coarse and fine thread bolts?",
        "a": "Coarse thread (UNC) bolts have fewer threads per inch, are more resistant to cross-threading, and are standard for general-purpose use. Fine thread (UNF) bolts have more threads per inch, providing higher tensile strength and better resistance to vibration loosening. Fine threads are common in automotive and aerospace applications."
      },
      {
        "q": "How do I measure bolt length?",
        "a": "Bolt length is measured from the bearing surface (underside of the head) to the end of the shank. For hex bolts and most standard bolts, this means the head is not included in the length. Exceptions include countersunk bolts (e.g., flat head), where length is measured from the top of the head since it sits flush with the surface."
      }
    ]
  },
  "anchors": {
    "title": "Anchors",
    "description": "Wall and concrete anchor specifications - toggle bolts, wedge anchors, and drywall anchors.",
    "what": "An anchor gives a screw or bolt something to hold in drywall, concrete, brick or block.",
    "lede": "Wall anchors, concrete anchors, toggle bolts, and expansion anchors.",
    "faq": [
      {
        "q": "How do I choose the right anchor for drywall?",
        "a": "For light loads (under 15 lbs), plastic expansion anchors are sufficient. For medium loads (15-50 lbs), self-drilling drywall anchors or molly bolts work well. For heavy loads (50+ lbs), toggle bolts or snap toggles are required, as they spread the load across a larger area behind the drywall."
      },
      {
        "q": "What is the difference between a wedge anchor and a sleeve anchor?",
        "a": "Both are concrete anchors, but they differ in mechanism. Wedge anchors expand a clip at the bottom of the hole as the nut is tightened, providing the highest holding values in solid concrete. Sleeve anchors expand along the full length of the anchor body, making them suitable for concrete, brick, and block — including hollow sections where wedge anchors would fail."
      },
      {
        "q": "Can I remove and reuse concrete anchors?",
        "a": "Most mechanical concrete anchors (wedge, drop-in, split drive) are permanent and cannot be fully removed. The expanded portion remains embedded in the concrete. Sleeve anchors and tapcon screws can sometimes be removed, but the hole is compromised for reinstallation at the same size. Chemical anchors are also permanent once cured."
      },
      {
        "q": "How deep should I drill for a concrete anchor?",
        "a": "Minimum embedment depth varies by anchor type and diameter but is typically at least 4-5 times the anchor diameter. The drilled hole should be 1/2\" deeper than the embedment depth to allow space for dust. Always use a hammer drill with a carbide-tipped masonry bit matching the anchor's specified hole diameter."
      },
      {
        "q": "What is the difference between a toggle bolt and a molly bolt?",
        "a": "Toggle bolts use spring-loaded wings that open behind the wall, providing high load capacity (up to 300+ lbs depending on size). The wings fall behind the wall if the bolt is removed. Molly bolts use a split sleeve that expands against the back of the drywall when tightened. Molly bolts stay in place when the screw is removed, allowing reuse of the same hole."
      }
    ]
  },
  "nuts": {
    "title": "Nuts",
    "description": "Nut specifications - hex nuts, lock nuts, wing nuts, and specialty nuts.",
    "what": "A nut threads onto a bolt or stud and clamps the joint.",
    "lede": "Hex nuts, lock nuts, wing nuts, and specialty fasteners.",
    "faq": [
      {
        "q": "What is the difference between a lock nut and a regular hex nut?",
        "a": "A regular hex nut relies solely on thread friction and clamping force to stay in place. Lock nuts have an additional locking mechanism — either a nylon insert (nyloc) that grips the bolt threads, or a prevailing torque design with a deformed top section. Lock nuts resist loosening from vibration and are used in automotive, machinery, and structural applications."
      },
      {
        "q": "Can I reuse nylon lock nuts?",
        "a": "Nylon lock nuts (nyloc) lose locking effectiveness after repeated installation and removal. The nylon insert deforms to grip the bolt threads, and this deformation reduces with each use. Most manufacturers recommend single-use for critical applications. For non-critical applications, they may be reused 2-3 times if the nylon insert still provides noticeable resistance during threading."
      },
      {
        "q": "What is a castle nut used for?",
        "a": "Castle nuts (also called castellated nuts) have slots cut into the top that align with a hole in the bolt. A cotter pin is inserted through the slot and bolt hole to positively lock the nut in place. They are used in safety-critical applications such as steering linkages, wheel bearings, and aircraft assemblies where the nut must never loosen."
      },
      {
        "q": "When should I use a flange nut instead of a nut with a washer?",
        "a": "Flange nuts have a built-in washer (flange) at the base that distributes load and prevents the nut from pulling through soft materials. They eliminate the need for a separate washer, reducing parts count and assembly time. Serrated flange nuts also provide vibration resistance. Use them in automotive and assembly-line applications where speed and reliability matter."
      },
      {
        "q": "What size wrench do I need for a given nut?",
        "a": "Wrench size corresponds to the width across flats (WAF) of the nut, not the thread size. For imperial nuts, common pairings: 1/4\" bolt = 7/16\" wrench, 5/16\" bolt = 1/2\" wrench, 3/8\" bolt = 9/16\" wrench, 1/2\" bolt = 3/4\" wrench. For metric: M6 = 10mm, M8 = 13mm, M10 = 17mm, M12 = 19mm. Always verify — some standards differ."
      }
    ]
  },
  "washers": {
    "title": "Washers",
    "description": "Comprehensive washer specifications - flat washers, lock washers, spring washers, and specialty washers.",
    "what": "A washer sits under a head or a nut to spread the load, seal the hole or resist loosening.",
    "lede": "Flat washers, lock washers, spring washers, and specialty washers for load distribution and vibration resistance.",
    "faq": [
      {
        "q": "Do I always need a washer with a bolt?",
        "a": "Not always, but washers are recommended in most applications. They distribute the clamping load over a larger area, prevent surface damage, and provide a consistent bearing surface for the nut or bolt head. Washers are especially important on soft materials (wood, aluminum, plastic) where the fastener head could pull through or crush the surface."
      },
      {
        "q": "What is the difference between a flat washer and a fender washer?",
        "a": "Fender washers have a much larger outer diameter relative to the hole size compared to standard flat washers. This extra surface area spreads the load over a wider area, making them ideal for thin or soft materials where a standard washer might pull through. They are commonly used in automotive body panels, sheet metal, and drywall applications."
      },
      {
        "q": "Do lock washers actually prevent loosening?",
        "a": "Split lock washers (helical spring washers) are the most common type, but testing by the Junker vibration test shows they provide minimal anti-loosening benefit compared to a properly torqued plain washer. For reliable vibration resistance, Nord-Lock wedge-locking washers, thread-locking adhesive, or prevailing torque nuts are more effective solutions."
      },
      {
        "q": "What size washer do I need for a given bolt?",
        "a": "Washer sizing is based on the bolt diameter. The washer's inner diameter should be slightly larger than the bolt shank — typically 1/16\" larger for imperial sizes. For example, a 1/2\" bolt uses a washer with a 9/16\" inner diameter. Standard washer outer diameters and thicknesses are defined by SAE (narrow) and USS (wide) specifications for imperial, and ISO 7089/7093 for metric."
      },
      {
        "q": "When should I use a Belleville washer?",
        "a": "Belleville washers (conical spring washers) maintain tension in a bolted joint by acting as a spring. They compensate for thermal expansion, settling, and relaxation of the clamped materials. Use them in applications requiring consistent clamping force over time — such as flanged pipe connections, electrical connections, and high-temperature assemblies where differential expansion occurs."
      }
    ]
  }
};

// What the words on the box mean. One plain sentence each, true of every entry
// that carries the value, so nothing here is specific to one fastener.
export const GLOSS: Record<'head' | 'drive' | 'thread' | 'point', Record<string, string>> = {
  head: {
    flat: 'Flat on top. Sits flush with the surface.',
    pan: 'Low dome, flat underneath. Sits on top of the surface.',
    round: 'Rounded top. Sits on top of the surface.',
    hex: 'Six-sided. Turned with a wrench or socket.',
    socket: 'A cylinder with a hex socket in the top.',
    button: 'A low dome with a hex socket in the top.',
    carriage: 'A smooth dome over a square neck. The neck bites into wood so the bolt cannot turn.',
  },
  drive: {
    phillips: 'Cross-shaped recess. Takes a Phillips screwdriver or bit.',
    slotted: 'A single slot. Takes a flat-blade screwdriver.',
    // A hex drive is the head itself on a hex head, and a socket on anything else.
    hex: 'Hex socket. Takes a hex key (Allen wrench).',
    'hex-head': 'Turned by its head with a wrench or socket.',
    torx: 'Six-point star recess. Takes a Torx (star) bit.',
    square: 'Square recess. Takes a square (Robertson) bit.',
  },
  thread: {
    machine: 'Even thread on a straight shank. Fits a nut or a threaded hole.',
    wood: 'Deep, coarse thread. Cuts its own way into wood.',
    coarse: 'Deep thread with wide spacing.',
    'self-tapping': 'Cuts its own thread in the material as it is driven.',
  },
  point: {
    gimlet: 'Tapered, threaded tip. Pulls itself into wood.',
    sharp: 'Comes to a sharp point.',
    blunt: 'Flat end. Does not start its own hole.',
    'type-17': 'Sharp tip with a slot cut in it. The slot clears wood as the screw goes in.',
    'self-drilling': 'Tip shaped like a drill bit. Drills its own hole in metal.',
  },
};

/** Pairs that get mistaken for each other, as [slug, slug]. */
export const PAIRS: [string, string][] = [
  ['wood-screw', 'drywall-screw'],
  ['hex-bolt', 'carriage-bolt'],
  ['toggle-bolt', 'molly-bolt'],
  ['lock-nut', 'hex-nut'],
  ['flat-washer', 'lock-washer'],
  ['wedge-anchor', 'sleeve-anchor'],
];
