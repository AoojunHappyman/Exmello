import { MoodType, ConcernType, NeedType, RecommendationResult } from '@/types';

export function getRecommendation(
  mood: MoodType,
  concern: ConcernType,
  need?: NeedType
): RecommendationResult {
  // An explicitly selected need takes precedence over inferred mood/concern rules.
  if (need) {
    const explicitNeedRecommendations: Record<NeedType, RecommendationResult> = {
      focus: {
        id: 'need-focus',
        headline: 'เริ่มจากก้าวเล็ก ๆ ที่ทำได้ตอนนี้ 🌱',
        message: 'เลือกทำเพียงหนึ่งเรื่อง แล้วค่อย ๆ ให้เวลากับมัน โดยไม่ต้องรีบจัดการทุกอย่างพร้อมกัน',
        primaryAction: { type: 'focus', label: 'เริ่มโฟกัส 25 นาที →', path: '/focus?duration=25', durationMinutes: 25 },
        secondaryActions: [
          { type: 'reset', label: 'ขอพักสั้น ๆ ก่อน', path: '/reset' },
          { type: 'breathing', label: 'ฝึกหายใจ', path: '/breathing?mode=box' },
        ],
        badge: 'ตามสิ่งที่คุณต้องการ: โฟกัส',
      },
      calm: {
        id: 'need-calm',
        headline: 'พักสักครู่ แล้วค่อยกลับมา 🌿',
        message: 'ลองผ่อนลมหายใจช้า ๆ ให้ตัวเองได้ตั้งหลักก่อน เรื่องอื่นค่อยคิดทีละอย่าง',
        primaryAction: { type: 'breathing', label: 'เริ่มฝึกหายใจ →', path: '/breathing?mode=box', durationMinutes: 3, mode: 'box' },
        secondaryActions: [
          { type: 'reset', label: 'ลองรีเซ็ตสั้น ๆ', path: '/reset' },
          { type: 'resource', label: 'อ่านคู่มือคลายกังวล', path: '/resources/managing-exam-anxiety' },
        ],
        badge: 'ตามสิ่งที่คุณต้องการ: ใจสงบ',
      },
      break: {
        id: 'need-break',
        headline: 'พักได้โดยไม่ต้องรู้สึกผิด ☕',
        message: 'ลุกจากโต๊ะ จิบน้ำ หรือพักสายตาสักครู่ การหยุดพักก็เป็นส่วนหนึ่งของการดูแลตัวเอง',
        primaryAction: { type: 'reset', label: 'ไปที่ศูนย์รีเซ็ตตัวเอง →', path: '/reset', durationMinutes: 5 },
        secondaryActions: [
          { type: 'breathing', label: 'ฝึกหายใจเบา ๆ', path: '/breathing?mode=sigh' },
          { type: 'focus', label: 'กลับมาโฟกัสภายหลัง', path: '/focus?duration=15' },
        ],
        badge: 'ตามสิ่งที่คุณต้องการ: พัก',
      },
      motivated: {
        id: 'need-motivated',
        headline: 'เริ่มแค่ 10 นาทีก็พอแล้ว ✨',
        message: 'เลือกงานชิ้นเล็กที่สุดแล้วลองเริ่มก่อน เมื่อครบเวลา คุณเลือกได้ว่าจะทำต่อหรือพัก',
        primaryAction: { type: 'focus', label: 'เริ่มโฟกัส 10 นาที →', path: '/focus?duration=10', durationMinutes: 10 },
        secondaryActions: [
          { type: 'reset', label: 'ยืดเส้นสั้น ๆ', path: '/reset' },
          { type: 'resource', label: 'อ่านวิธีเริ่มเมื่อสมองตัน', path: '/resources/blank-page-paralysis' },
        ],
        badge: 'ตามสิ่งที่คุณต้องการ: แรงเริ่มต้น',
      },
    };

    return explicitNeedRecommendations[need];
  }

  // R-01: Overwhelmed
  if (mood === 'overwhelmed') {
    return {
      id: 'r-01',
      headline: 'มาหยุดพักโลกไว้สักสามนาทีก่อน 🌱',
      message: 'เนื้อหาบทเรียนรอได้ ให้ระบบประสาทของคุณได้พักหายใจก่อนนะ ตอนนี้ใจของคุณสำคัญที่สุด',
      bullets: [
        'ปิดแท็บเบราว์เซอร์อื่น ๆ ไว้ 3 นาที',
        'หายใจตามวงกลมที่เคลื่อนไหวอย่างช้า ๆ',
        'สังเกตช่วงไหล่ที่ค่อย ๆ คลายความเกร็งลง',
      ],
      primaryAction: {
        type: 'breathing',
        label: 'เริ่มฝึกหายใจ 3 นาที →',
        path: '/breathing?mode=box&duration=3',
        durationMinutes: 3,
        mode: 'box',
      },
      secondaryActions: [
        { type: 'reset', label: 'รีเซ็ตดื่มน้ำ 1 นาที', path: '/reset' },
        { type: 'resource', label: 'คู่มือรับมือความกังวล', path: '/resources/managing-exam-anxiety' },
      ],
      mascotQuote: 'ค่อย ๆ หายใจทีละก้าว 🐻‍❄️',
      badge: 'คำแนะนำ: รีเซ็ตระบบประสาท',
    };
  }

  // R-02: Stressed + Running out of time
  if (mood === 'stressed' && concern === 'running_out_of_time') {
    return {
      id: 'r-02',
      headline: 'ความลนลานขโมยเวลา แต่สมาธิจะดึงเวลากลับมา ⏳',
      message: 'มาเลือกอ่านแค่จุดสำคัญเพียงจุดเดียวใน 15 นาทีนี้ ไม่ต้องกังวลเรื่องอื่นในระหว่างนี้',
      bullets: [
        'เลือกเฉพาะสูตรหรือโจทย์สำคัญที่สุดข้อเดียว',
        'ตั้งช่วงเวลาอ่านสั้น ๆ 15 นาทีแบบไม่กดดันตัวเอง',
        'เมื่อเสียงเตือนดัง ค่อยหยุดประเมินใหม่อีกครั้ง',
      ],
      primaryAction: {
        type: 'focus',
        label: 'เริ่มโฟกัส 15 นาที →',
        path: '/focus?duration=15',
        durationMinutes: 15,
      },
      secondaryActions: [
        { type: 'breathing', label: 'ฝึกหายใจถอนใจ 2 นาที', path: '/breathing?mode=sigh' },
        { type: 'reset', label: 'ศูนย์รีเซ็ตตัวเอง', path: '/reset' },
      ],
      mascotQuote: '15 นาทีก็สร้างความก้าวหน้าได้มากแล้ว ◡̈',
      badge: 'คำแนะนำ: โฟกัสระยะสั้นเร่งด่วน',
    };
  }

  // R-03: Stressed + Can't finish studying
  if (mood === 'stressed' && concern === 'cant_finish') {
    return {
      id: 'r-03',
      headline: 'เราเริ่มจากเรื่องเล็ก ๆ ก่อนก็ได้ 🌱',
      message: 'คุณไม่จำเป็นต้องทำทุกอย่างให้เสร็จในตอนนี้ ลองเลือกทำทีละอย่างก่อน',
      bullets: [
        'โฟกัสทีละหนึ่งหัวข้อหรือทีละหน้าก่อน',
        'ใช้ช่วงเวลาโฟกัสเงียบ ๆ 25 นาที',
        'พักสายตา 5 นาทีแบบตั้งใจโดยไม่แตะหน้าจอ',
      ],
      primaryAction: {
        type: 'focus',
        label: 'เริ่มโฟกัส 25 นาที →',
        path: '/focus?duration=25',
        durationMinutes: 25,
      },
      secondaryActions: [
        { type: 'reset', label: 'รีเซ็ต 3 นาที', path: '/reset' },
        { type: 'breathing', label: 'ลองฝึกหายใจ', path: '/breathing' },
        { type: 'resource', label: 'ดูข้อมูลเพิ่มเติม', path: '/resources' },
      ],
      mascotQuote: 'ค่อย ๆ ทำทีละก้าว 🐻‍❄️',
      badge: 'คำแนะนำสำหรับคุณ',
    };
  }

  // R-04: Stressed + Worried about exam
  if (mood === 'stressed' && concern === 'worried_exam') {
    return {
      id: 'r-04',
      headline: 'ใจคุณพร้อมแล้วนะ มาช่วยให้ชีพจรเต้นช้าลงกัน 💛',
      message: 'ความกังวลคือร่างกายกำลังเตรียมพร้อมรับมือ มาปรับลมหายใจให้สบายและเรียกสติกลับมา',
      bullets: [
        'ฝึกหายใจแบบสี่เหลี่ยม (Box Breathing) เพื่อลดอะดรีนาลีน',
        'เปลี่ยนความคิดกลัวล่วงหน้า ให้เป็นก้าวเล็ก ๆ ตรงหน้า',
        'จิบน้ำเย็นสักอึกก่อนเริ่มอ่านต่อ',
      ],
      primaryAction: {
        type: 'breathing',
        label: 'เริ่มฝึกหายใจแบบกล่อง →',
        path: '/breathing?mode=box',
        durationMinutes: 3,
        mode: 'box',
      },
      secondaryActions: [
        { type: 'resource', label: 'อ่าน "เช้าวันสอบแบบใจสงบ"', path: '/resources/exam-morning-ritual' },
        { type: 'focus', label: 'เริ่มโฟกัสเบา ๆ 15 นาที', path: '/focus?duration=15' },
      ],
      mascotQuote: 'คุณรู้มากกว่าที่คุณคิดนะ 🌱',
      badge: 'คำแนะนำ: คลายความกังวลข้อสอบ',
    };
  }

  // R-05: Didn't sleep enough
  if (concern === 'didnt_sleep') {
    return {
      id: 'r-05',
      headline: 'สมองที่ล้าเกินไปจะจำเนื้อหาไม่เข้า 😴',
      message: 'วางชีทสรุปลง 5 นาที ดื่มน้ำสักแก้ว ยืดเส้น และพักสายตาสักครู่ เพื่อให้สมองได้ฟื้นตัว',
      bullets: [
        'มองออกไปนอกหน้าต่าง 60 วินาที (กฎ 20-20-20)',
        'ดื่มน้ำเปล่าอุณหภูมิห้อง 1 แก้วใหญ่',
        'หมุนหัวไหล่ไปด้านหลังเบา ๆ 5 ครั้ง',
      ],
      primaryAction: {
        type: 'reset',
        label: 'รีเซ็ตตัวเอง 5 นาที →',
        path: '/reset',
        durationMinutes: 5,
      },
      secondaryActions: [
        { type: 'resource', label: 'ทำไมการนอน 7 ชม. ชนะการโต้รุ่ง', path: '/resources/sleep-better-study-better' },
        { type: 'focus', label: 'ทบทวนสั้น ๆ แบบไม่ฝืน 15 นาที', path: '/focus?duration=15' },
      ],
      mascotQuote: 'การพักผ่อนคือส่วนหนึ่งของการอ่านหนังสือ 🌿',
      badge: 'คำแนะนำ: ฟื้นฟูร่างกาย',
    };
  }

  // R-06: Feeling exhausted
  if (concern === 'exhausted') {
    return {
      id: 'r-06',
      headline: 'การฝืนอ่านต่อตอนนี้อาจได้ผลน้อยลงแล้ว ☕',
      message: 'การฝืนร่างกายที่หมดพลังจะทำให้เพลียสะสม ให้โอกาสตัวเองได้พักสักครู่โดยไม่ต้องรู้สึกผิด',
      bullets: [
        'ลุกขึ้นและก้าวออกจากโต๊ะอ่านหนังสือ',
        'หลับตาพักในที่ที่มีแสงนุ่มนวล',
        'ปล่อยให้ใจได้ลอยและพักผ่อนจริง ๆ',
      ],
      primaryAction: {
        type: 'reset',
        label: 'รีเซ็ตตัวเองสั้น ๆ →',
        path: '/reset',
        durationMinutes: 5,
      },
      secondaryActions: [
        { type: 'breathing', label: 'ฝึกหายใจคลายเครียด 3 นาที', path: '/breathing?mode=sigh' },
        { type: 'resource', label: 'รีเซ็ตสมองใน 5 นาที', path: '/resources/5-minute-brain-reset' },
      ],
      mascotQuote: 'ใจดีกับตัวเองในวันนี้ด้วยนะ 💛',
      badge: 'คำแนะนำ: พักฟื้นพลังงาน',
    };
  }

  // R-07: Racing thoughts
  if (concern === 'racing_thoughts') {
    return {
      id: 'r-07',
      headline: 'ดึงความคิดกลับมาอยู่กับห้องนี้กัน 🍃',
      message: 'ความคิดกำลังวิ่งล้ำหน้าไปไกล มาดึงสติกลับมาที่ร่างกายตัวเองในขณะนี้กันก่อน',
      bullets: [
        'ใช้เทคนิคสังเกตสิ่งรอบตัว 5-4-3-2-1',
        'หายใจออกให้ยาวกว่าตอนหายใจเข้าสองเท่า',
        'ใช้กระดาน Brain Dump เทความกังวลออกจากหัว',
      ],
      primaryAction: {
        type: 'breathing',
        label: 'เริ่มฝึกหายใจดึงสติ 3 นาที →',
        path: '/breathing?mode=sigh',
        durationMinutes: 3,
        mode: 'sigh',
      },
      secondaryActions: [
        { type: 'reset', label: 'กระดาน Brain Dump', path: '/reset' },
        { type: 'focus', label: 'เริ่มโฟกัส 25 นาที', path: '/focus?duration=25' },
      ],
      mascotQuote: 'หายใจเข้าสบาย หายใจออกผ่อนคลาย 🕊️',
      badge: 'คำแนะนำ: เคลียร์ความคิดในหัว',
    };
  }

  // R-08: Can't remember
  if (concern === 'cant_remember') {
    return {
      id: 'r-08',
      headline: 'ฮอร์โมนความเครียดกำลังบดบังความจำอยู่ 🧠',
      message: 'สิ่งที่คุณอ่านไม่ได้หายไปไหน แค่ต้องให้ร่างกายผ่อนคลายลง ความจำจะกลับมาเอง',
      bullets: [
        'หลับตาลง 2 นาทีและหายใจช้า ๆ',
        'ทบทวนเฉพาะใจความสำคัญสั้น ๆ ทีละข้อ',
        'ทดสอบตัวเองแบบสบาย ๆ ไม่ต้องกดดัน',
      ],
      primaryAction: {
        type: 'reset',
        label: 'รีเซ็ตตัวเอง 2 นาที →',
        path: '/reset',
        durationMinutes: 2,
      },
      secondaryActions: [
        { type: 'focus', label: 'โฟกัสทบทวน 25 นาที', path: '/focus?duration=25' },
        { type: 'resource', label: 'คู่มือวิทยาศาสตร์ความจำ', path: '/resources/sleep-better-study-better' },
      ],
      mascotQuote: 'ความรู้อยู่ในนั้นแล้ว แค่ให้เวลากับมัน 🌿',
      badge: 'คำแนะนำ: ฟื้นฟูการดึงความจำ',
    };
  }

  // R-09: Good / Great mood
  if ((mood === 'good' || mood === 'great') && (concern === 'cant_finish' || need === 'focus')) {
    return {
      id: 'r-09',
      headline: 'วันนี้พลังงานของคุณดีมากเลย 🚀',
      message: 'มาใช้จังหวะที่ใจพร้อมนี้ ลุยอ่านหนังสืออย่างมีสมาธิและไร้สิ่งรบกวนกัน',
      bullets: [
        'วางโทรศัพท์คว่ำหน้าลงหรือเปิดโหมดเงียบ',
        'ลงมือทำโจทย์หรืออ่านหัวข้อสำคัญ',
        'ชื่นชมตัวเองเมื่อจบแต่ละเป้าหมาย',
      ],
      primaryAction: {
        type: 'focus',
        label: 'เริ่มโฟกัส 25 นาที →',
        path: '/focus?duration=25',
        durationMinutes: 25,
      },
      secondaryActions: [
        { type: 'focus', label: 'ช่วงโฟกัสเข้มข้น 50 นาที', path: '/focus?duration=50' },
        { type: 'resource', label: 'เทคนิคการสร้างสมาธิ', path: '/resources/blank-page-paralysis' },
      ],
      mascotQuote: 'ลุยไปกับความสมาธิที่ลื่นไหลเลย! ✨',
      badge: 'คำแนะนำ: โฟกัสลึกต่อเนื่อง',
    };
  }

  // R-10: Need motivation
  if (need === 'motivated' || mood === 'okay') {
    return {
      id: 'r-10',
      headline: 'การเริ่มต้นคือก้าวที่ยากที่สุด 🌱',
      message: 'ลองเปิดอ่านแค่ 10 นาทีสั้น ๆ ก่อน ถ้าครบ 10 นาทีแล้วไม่อยากต่อ ก็พักได้เลยตามสบาย',
      bullets: [
        'อ่านหรือจดโน้ตเพียงหนึ่งย่อหน้าเล็ก ๆ',
        'ไม่ต้องคาดหวังความสมบูรณ์แบบในรอบแรก',
        'ปล่อยให้ความต่อเนื่องพาเราไปต่อเอง',
      ],
      primaryAction: {
        type: 'focus',
        label: 'เริ่มโฟกัสสบาย ๆ 10 นาที →',
        path: '/focus?duration=10',
        durationMinutes: 10,
      },
      secondaryActions: [
        { type: 'reset', label: 'ยืดเส้นบนเก้าอี้ 1 นาที', path: '/reset' },
        { type: 'resource', label: 'วิธีแก้สมองตันตอนเริ่ม', path: '/resources/blank-page-paralysis' },
      ],
      mascotQuote: 'การลงมือทำสร้างพลังใจ ◡̈',
      badge: 'คำแนะนำ: เริ่มต้นด้วยก้าวเล็ก ๆ',
    };
  }

  // R-FALLBACK: Default supportive match
  return {
    id: 'r-fallback',
    headline: 'เราเริ่มจากเรื่องเล็ก ๆ ก่อนก็ได้ 🌱',
    message: 'คุณไม่จำเป็นต้องทำทุกอย่างให้เสร็จในตอนนี้ ค่อย ๆ ไปทีละก้าวอย่างอ่อนโยนกับตัวเองนะ',
    bullets: [
      'โฟกัสทีละหนึ่งหัวข้อหรือทีละหน้าก่อน',
      'ใช้ช่วงเวลาโฟกัสเงียบ ๆ 25 นาที',
      'พักสายตา 5 นาทีแบบตั้งใจโดยไม่แตะหน้าจอ',
    ],
    primaryAction: {
      type: 'focus',
      label: 'เริ่มโฟกัส 25 นาที →',
      path: '/focus?duration=25',
      durationMinutes: 25,
    },
    secondaryActions: [
      { type: 'reset', label: 'รีเซ็ต 3 นาที', path: '/reset' },
      { type: 'breathing', label: 'ลองฝึกหายใจ', path: '/breathing' },
      { type: 'resource', label: 'ดูข้อมูลเพิ่มเติม', path: '/resources' },
    ],
    mascotQuote: 'ค่อย ๆ ทำทีละก้าว 🐻‍❄️',
    badge: 'คำแนะนำสำหรับคุณ',
  };
}
