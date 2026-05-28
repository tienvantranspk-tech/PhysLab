import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // note: framer-motion is correctly used
import { Award, BookOpen, X, Check, HelpCircle, Heart, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useUser } from '../context/UserContext';
import useSoundEffects from '../hooks/useSoundEffects';

// Mapping from labId to lesson progression in the map
const LAB_LESSON_MAP = {
  freefall: { id: 'mech_01', nextId: 'mech_02' },
  pendulum: { id: 'mech_02', nextId: 'mech_03' },
  incline: { id: 'mech_03', nextId: 'mech_04' },
  mirror: { id: 'optic_01', nextId: 'optic_02' },
  optics: { id: 'optic_02', nextId: 'optic_03' },
  prism: { id: 'optic_03', nextId: null },
  ohm: { id: 'elec_04', nextId: 'elec_05' },
  circuit: { id: 'elec_03', nextId: 'elec_04' },
  thermo: { id: 'thermo_01', nextId: 'thermo_02' },
  wave: { id: 'wave_02', nextId: null }
};

// Comprehensive Question Bank: 3 conceptual questions for every lab
const LAB_QUESTIONS_BANK = {
  circuit: [
    {
      question: "Nếu nối hai cực của viên pin bằng một đoạn dây dẫn mà không qua thiết bị tiêu thụ điện nào, hiện tượng gì sẽ xảy ra?",
      options: [
        "Bóng đèn trong mạch sẽ sáng mạnh gấp đôi thông thường",
        "Xảy ra đoản mạch (ngắn mạch) cực kỳ nguy hiểm, làm nóng pin và có thể cháy hỏng",
        "Không có bất kỳ dòng điện nào chạy qua mạch"
      ],
      correctIdx: 1,
      tip: "💡 Khi điện trở của mạch quá nhỏ (gần bằng 0), cường độ dòng điện tăng vọt gây chập cháy!"
    },
    {
      question: "Trong mạch điện đơn giản, bóng đèn phát sáng được là nhờ dòng chuyển động có hướng của:",
      options: [
        "Các hạt proton tích điện dương",
        "Các electron tự do mang điện tích âm ngược chiều điện trường",
        "Các nguyên tử kim loại cấu tạo nên dây dẫn"
      ],
      correctIdx: 1,
      tip: "💡 Dòng điện trong kim loại là dòng dịch chuyển có hướng của các electron tự do dưới tác dụng của điện trường."
    },
    {
      question: "Công tắc (khóa K) trong sơ đồ mạch điện dùng để thực hiện chức năng gì?",
      options: [
        "Tăng điện áp của nguồn điện lên mức cao hơn",
        "Bảo vệ pin khỏi bị chai hoặc hết điện đột ngột",
        "Đóng hoặc ngắt dòng điện trong mạch để điều khiển thiết bị tiêu thụ"
      ],
      correctIdx: 2,
      tip: "💡 Khóa K đóng thì mạch kín có dòng điện, khóa K mở thì mạch hở dòng điện bị ngắt hoàn toàn."
    }
  ],
  optics: [
    {
      question: "Khi đặt một vật sáng trước thấu kính hội tụ và nằm trong khoảng tiêu cự (d < f), thấu kính sẽ tạo ra ảnh có đặc điểm gì?",
      options: [
        "Ảnh thật, ngược chiều và nhỏ hơn vật",
        "Ảnh ảo, cùng chiều và lớn hơn vật",
        "Ảnh thật, ngược chiều và lớn hơn vật"
      ],
      correctIdx: 1,
      tip: "💡 d < f tạo ảnh ảo nằm cùng phía với vật, phóng to và thẳng đứng, ứng dụng làm kính lúp!"
    },
    {
      question: "Chùm tia sáng song song đi qua trục chính của thấu kính hội tụ, sau khi khúc xạ qua thấu kính sẽ hội tụ tại:",
      options: [
        "Quang tâm O của thấu kính",
        "Tiêu điểm ảnh chính F' của thấu kính",
        "Một điểm bất kỳ trên màn chắn"
      ],
      correctIdx: 1,
      tip: "💡 Tia tới song song với trục chính thì tia ló tương ứng đi qua tiêu điểm ảnh chính F'."
    },
    {
      question: "Một kính lúp đơn giản dùng để quan sát các vật nhỏ thực chất là một:",
      options: [
        "Thấu kính phân kỳ có tiêu cự rất lớn",
        "Gương cầu lồi có bán kính nhỏ",
        "Thấu kính hội tụ có tiêu cự ngắn"
      ],
      correctIdx: 2,
      tip: "💡 Kính lúp là thấu kính hội tụ tiêu cự ngắn (vài cm), đặt vật trong khoảng tiêu cự để quan sát ảnh ảo phóng đại."
    }
  ],
  hooke: [
    {
      question: "Theo định luật Hooke, trong giới hạn đàn hồi, lực đàn hồi của lò xo liên hệ thế nào với độ biến dạng x?",
      options: [
        "Tỉ lệ nghịch với độ biến dạng x",
        "Tỉ lệ thuận với độ biến dạng x (F = k * |x|)",
        "Không phụ thuộc gì vào độ biến dạng x"
      ],
      correctIdx: 1,
      tip: "💡 Độ biến dạng (kéo giãn hoặc nén) càng lớn thì lò xo sinh ra lực phản kháng đàn hồi càng mạnh."
    },
    {
      question: "Nếu treo một vật có khối lượng gấp đôi vào lò xo (trong giới hạn đàn hồi), độ giãn của lò xo sẽ biến đổi thế nào?",
      options: [
        "Lò xo giãn ra gấp đôi so với ban đầu",
        "Lò xo giữ nguyên chiều dài không đổi",
        "Lò xo giãn ra gấp bốn lần ban đầu"
      ],
      correctIdx: 0,
      tip: "💡 F_đh = P = m*g. Vì lực kéo tỉ lệ thuận với khối lượng, nên khối lượng gấp đôi thì độ giãn x cũng gấp đôi."
    },
    {
      question: "Độ cứng (hệ số đàn hồi) k của lò xo phụ thuộc chủ yếu vào các yếu tố nào?",
      options: [
        "Khối lượng của vật nặng treo vào lò xo",
        "Kích thước hình học, số vòng dây và chất liệu làm lò xo",
        "Vận tốc kéo giãn lò xo lúc thí nghiệm"
      ],
      correctIdx: 1,
      tip: "💡 Độ cứng k là đặc tính nội tại của lò xo, không phụ thuộc lực kéo bên ngoài mà phụ thuộc hình dạng, chất liệu."
    }
  ],
  projectile: [
    {
      question: "Bỏ qua sức cản không khí, để vật ném xiên từ mặt đất đạt được tầm xa nằm ngang cực đại, ta nên chọn góc bắn bằng bao nhiêu độ?",
      options: [
        "Góc bắn 30 độ",
        "Góc bắn 45 độ",
        "Góc bắn 60 độ"
      ],
      correctIdx: 1,
      tip: "💡 Góc bắn 45 độ chia đều vector vận tốc ban đầu sang cả phương ngang và phương đứng, tối ưu tầm xa."
    },
    {
      question: "Trong chuyển động ném ngang, vận tốc theo phương nằm ngang (v_x) thay đổi như thế nào trong suốt quá trình bay?",
      options: [
        "Tăng dần đều do tác dụng của trọng lực",
        "Không thay đổi do không có lực cản tác dụng theo phương ngang",
        "Giảm dần về không khi chạm đất"
      ],
      correctIdx: 1,
      tip: "💡 Theo phương ngang vật không chịu lực tác dụng nên chuyển động thẳng đều với vận tốc không đổi v_x = v_0."
    },
    {
      question: "Thời gian rơi của một vật chuyển động ném ngang từ độ cao h phụ thuộc vào những yếu tố nào?",
      options: [
        "Vận tốc ban đầu v_0 lúc ném vật",
        "Khối lượng của vật được ném đi",
        "Độ cao h của điểm ném và gia tốc trọng trường g"
      ],
      correctIdx: 2,
      tip: "💡 t = sqrt(2h/g). Thời gian rơi chỉ phụ thuộc độ cao h và g, hoàn toàn độc lập với vận tốc ném ngang v_0."
    }
  ],
  collision: [
    {
      question: "Trong một vụ va chạm hoàn toàn đàn hồi (elastic collision), đại lượng vật lý nào sau đây được bảo toàn?",
      options: [
        "Chỉ bảo toàn động lượng của hệ",
        "Chỉ bảo toàn tổng động năng của hệ",
        "Bảo toàn cả tổng động lượng và tổng động năng của hệ"
      ],
      correctIdx: 2,
      tip: "💡 Va chạm đàn hồi lý tưởng không làm thất thoát năng lượng dưới dạng nhiệt năng hay âm thanh."
    },
    {
      question: "Đại lượng vật lý bằng tích của khối lượng m và vận tốc v của một vật được gọi là gì?",
      options: [
        "Động năng",
        "Động lượng của vật (p = m*v)",
        "Thế năng trọng trường"
      ],
      correctIdx: 1,
      tip: "💡 Động lượng là vector chỉ mức độ truyền chuyển động cơ học của vật, p = m * v."
    },
    {
      question: "Trong va chạm mềm (hai vật dính vào nhau sau va chạm), phần năng lượng bị tiêu hao chủ yếu biến đổi thành dạng nào?",
      options: [
        "Năng lượng hóa học",
        "Nhiệt năng làm nóng vật và năng lượng âm thanh",
        "Không có năng lượng nào bị tiêu hao"
      ],
      correctIdx: 1,
      tip: "💡 Va chạm mềm không bảo toàn động năng. Phần động năng hao hụt chuyển hóa thành nhiệt năng làm biến dạng và nóng vật."
    }
  ],
  archimedes: [
    {
      question: "Khi một khối gỗ nổi ổn định và cân bằng trên mặt nước, độ lớn của lực đẩy Archimedes lúc này bằng bao nhiêu?",
      options: [
        "Lớn hơn trọng lượng thực tế của khối gỗ",
        "Nhỏ hơn trọng lượng thực tế của khối gỗ",
        "Bằng đúng trọng lượng của khối gỗ (F_A = P)"
      ],
      correctIdx: 2,
      tip: "💡 Vì khối gỗ nằm cân bằng tĩnh, hợp lực tác dụng lên nó bằng 0, lực đẩy hướng lên triệt tiêu hoàn toàn trọng lực hướng xuống."
    },
    {
      question: "Lực đẩy Archimedes tác dụng lên một vật nhúng trong chất lỏng có độ lớn bằng:",
      options: [
        "Trọng lượng của khối chất lỏng bị vật chiếm chỗ",
        "Trọng lượng riêng của bản thân vật",
        "Thể tích tổng cộng của vật"
      ],
      correctIdx: 0,
      tip: "💡 F_A = d * V_chiếm_chỗ, bằng đúng trọng lượng của thể tích chất lỏng bị vật đẩy ra ngoài."
    },
    {
      question: "Thả hai vật có cùng thể tích nhưng khối lượng khác nhau vào nước. Lực đẩy Archimedes tác dụng lên chúng khi chìm hoàn toàn thế nào?",
      options: [
        "Vật nặng hơn chịu lực đẩy lớn hơn",
        "Vật nhẹ hơn chịu lực đẩy lớn hơn",
        "Lực đẩy tác dụng lên cả hai vật bằng nhau"
      ],
      correctIdx: 2,
      tip: "💡 Vì chìm hoàn toàn và có cùng thể tích, thể tích nước chiếm chỗ bằng nhau nên F_A tác dụng lên cả hai bằng nhau."
    }
  ],
  faraday: [
    {
      question: "Theo định luật cảm ứng điện từ Faraday, dòng điện cảm ứng chỉ được sinh ra trong cuộn dây kín khi nào?",
      options: [
        "Thanh nam châm nằm yên hoàn toàn ngay sát cuộn cảm",
        "Có sự biến thiên từ thông qua diện tích cuộn dây (nam châm di chuyển)",
        "Cuộn dây làm bằng chất liệu phi kim cách điện"
      ],
      correctIdx: 1,
      tip: "💡 Từ thông biến thiên sinh ra suất điện động cảm ứng. Nam châm chuyển động càng nhanh dòng cảm ứng càng lớn."
    },
    {
      question: "Khi ta đưa một cực của nam châm lại gần cuộn dây kín, dòng điện cảm ứng sinh ra sẽ có chiều sao cho từ trường của nó:",
      options: [
        "Hút nam châm vào nhanh hơn nữa",
        "Chống lại sự chuyển động dịch lại gần của nam châm (đẩy ra)",
        "Hoàn toàn không tương tác gì với nam châm"
      ],
      correctIdx: 1,
      tip: "💡 Định luật Lenz: Dòng điện cảm ứng có chiều sao cho từ trường do nó sinh ra chống lại nguyên nhân sinh ra nó."
    },
    {
      question: "Độ lớn của suất điện động cảm ứng xuất hiện trong cuộn dây kín tỉ lệ thuận với đại lượng nào?",
      options: [
        "Khối lượng của cuộn dây dẫn điện",
        "Tốc độ biến thiên từ thông qua diện tích cuộn dây",
        "Điện trở thuần của dây dẫn"
      ],
      correctIdx: 1,
      tip: "💡 e_c = - dPhi / dt. Suất điện động cảm ứng tỉ lệ thuận với tốc độ biến thiên từ thông qua mạch."
    }
  ],
  rlc: [
    {
      question: "Hiện tượng cộng hưởng điện xảy ra trong mạch điện xoay chiều nối tiếp RLC khi thỏa mãn điều kiện nào?",
      options: [
        "Cảm kháng của cuộn dây bằng dung kháng của tụ điện (Z_L = Z_C)",
        "Điện trở R lớn gấp đôi dung kháng Z_C",
        "Dòng điện xoay chiều có tần số bằng không"
      ],
      correctIdx: 0,
      tip: "💡 Z_L = Z_C làm triệt tiêu phần kháng trở, mạch đạt dòng điện cực đại và dao động đồng pha với điện áp nguồn."
    },
    {
      question: "Khi mạch điện RLC nối tiếp đang xảy ra hiện tượng cộng hưởng điện, nếu ta tăng tần số nguồn điện xoay chiều thì cường độ dòng điện trong mạch sẽ:",
      options: [
        "Tiếp tục tăng mạnh hơn nữa",
        "Giảm đi vì mạch bị lệch khỏi trạng thái cộng hưởng",
        "Giữ nguyên không thay đổi"
      ],
      correctIdx: 1,
      tip: "💡 Ở trạng thái cộng hưởng, dòng điện đạt cực đại. Bất kỳ sự thay đổi tần số nào (làm Z_L khác Z_C) đều làm dòng điện giảm."
    },
    {
      question: "Trong mạch điện xoay chiều nối tiếp RLC, linh kiện nào thực hiện chức năng tiêu thụ và tỏa nhiệt năng chính?",
      options: [
        "Tụ điện xoay chiều C",
        "Cuộn cảm thuần L",
        "Điện trở thuần R"
      ],
      correctIdx: 2,
      tip: "💡 Cuộn cảm thuần và tụ điện chỉ tích trữ và trao đổi năng lượng (công suất phản kháng), duy nhất điện trở R tiêu thụ điện tỏa nhiệt."
    }
  ],
  shm: [
    {
      question: "Trong dao động điều hòa của con lắc lò xo, khi vật nặng đi qua vị trí cân bằng (x = 0), đại lượng nào đạt giá trị cực đại?",
      options: [
        "Thế năng đàn hồi của lò xo",
        "Động năng và tốc độ của vật nặng",
        "Gia tốc kéo về của hệ"
      ],
      correctIdx: 1,
      tip: "💡 Tại vị trí cân bằng x = 0, toàn bộ thế năng biến đổi hoàn toàn thành động năng cực đại."
    },
    {
      question: "Tần số góc ω của con lắc lò xo có độ cứng k và khối lượng vật nặng m được xác định bằng công thức nào?",
      options: [
        "ω = sqrt(m / k)",
        "ω = sqrt(k / m)",
        "ω = 2π * sqrt(k / m)"
      ],
      correctIdx: 1,
      tip: "💡 Tần số góc ω = sqrt(k / m), tỉ lệ thuận với độ cứng lò xo và tỉ lệ nghịch với căn bậc hai khối lượng vật nặng."
    },
    {
      question: "Đồ thị biểu diễn li độ x theo thời gian t của một vật dao động điều hòa có hình dạng gì?",
      options: [
        "Đoạn thẳng xiên xuất phát từ gốc tọa độ",
        "Đường parabol hướng lên trên",
        "Đường hình sin tuần hoàn"
      ],
      correctIdx: 2,
      tip: "💡 Li độ x = A*cos(ωt + phi) biến thiên tuần hoàn theo quy luật hàm cosin/sin nên có đồ thị dạng hình sin."
    }
  ],
  young: [
    {
      question: "Khi ta tăng khoảng cách D từ hai khe hẹp đến màn quan sát, khoảng cách giữa các vân sáng liên tiếp (khoảng vân i) sẽ thay đổi như thế nào?",
      options: [
        "Khoảng vân i sẽ tăng lên (giãn rộng ra)",
        "Khoảng vân i sẽ giảm đi (khít sát lại)",
        "Khoảng vân i giữ nguyên không đổi"
      ],
      correctIdx: 0,
      tip: "💡 Khoảng vân i = lambda * D / a, do đó i tỉ lệ thuận với khoảng cách D."
    },
    {
      question: "Hiện tượng giao thoa ánh sáng quan sát được trong thí nghiệm khe Young chứng minh ánh sáng có tính chất gì?",
      options: [
        "Tính chất hạt (quang điện)",
        "Tính chất sóng (lan truyền pha)",
        "Tính chất hóa học đặc biệt"
      ],
      correctIdx: 1,
      tip: "💡 Giao thoa và nhiễu xạ là những đặc trưng cơ bản của hiện tượng sóng, chứng minh ánh sáng có bản chất sóng."
    },
    {
      question: "Trong thí nghiệm giao thoa ánh sáng trắng, tại chính giữa màn quan sát (vân trung tâm) sẽ xuất hiện vân màu gì?",
      options: [
        "Vân sáng màu đỏ đậm",
        "Vân sáng màu chàm tím",
        "Vân sáng màu trắng"
      ],
      correctIdx: 2,
      tip: "💡 Tại trung tâm hiệu đường truyền bằng 0 cho tất cả màu sắc, mọi bước sóng đều cho vân sáng trùng nhau tạo ra màu trắng."
    }
  ],
  decay: [
    {
      question: "Sau khoảng thời gian bằng đúng 2 chu kỳ bán rã (2 * T), khối lượng chất phóng xạ còn lại bằng bao nhiêu phần trăm so với ban đầu?",
      options: [
        "50% khối lượng ban đầu",
        "25% khối lượng ban đầu",
        "12.5% khối lượng ban đầu"
      ],
      correctIdx: 1,
      tip: "💡 Sau 1 chu kỳ còn 1/2. Sau chu kỳ tiếp theo còn 1/2 của 1/2 là 1/4 (tương ứng với 25%)."
    },
    {
      question: "Tia phóng xạ anpha (α) thực chất là dòng chuyển động tốc độ cao của các hạt mang cấu tạo giống:",
      options: [
        "Hạt electron mang điện tích âm",
        "Hạt nhân nguyên tử Heli (He-4)",
        "Hạt neutron không mang điện"
      ],
      correctIdx: 1,
      tip: "💡 Phóng xạ α phát ra dòng hạt nhân Heli-4 tích điện +2e, có khả năng ion hóa mạnh nhưng đâm xuyên yếu."
    },
    {
      question: "Tia phóng xạ nào sau đây có bản chất là sóng điện từ bước sóng cực ngắn, đâm xuyên mạnh nhất và nguy hiểm nhất?",
      options: [
        "Tia phóng xạ beta trừ (β-)",
        "Tia phóng xạ anpha (α)",
        "Tia phóng xạ gamma (γ)"
      ],
      correctIdx: 2,
      tip: "💡 Tia gamma (γ) là sóng điện từ năng lượng cao, không có khối lượng nghỉ nên đâm xuyên qua bê tông, kim loại dày."
    }
  ],
  thermo: [
    {
      question: "Sự truyền nhiệt giữa hai vật tiếp xúc trực tiếp luôn diễn ra theo chiều tự phát nào?",
      options: [
        "Từ vật có khối lượng lớn hơn sang vật có khối lượng nhỏ hơn",
        "Từ vật có nhiệt độ cao hơn sang vật có nhiệt độ thấp hơn",
        "Từ vật có thể tích lớn hơn sang vật nhỏ hơn"
      ],
      correctIdx: 1,
      tip: "💡 Nhiệt lượng luôn tự truyền từ vật nóng hơn (nhiệt độ cao) sang vật lạnh hơn (nhiệt độ thấp) cho đến khi đạt cân bằng."
    },
    {
      question: "Nhiệt lượng cần cung cấp để làm nóng một vật rắn tỉ lệ thuận với những đại lượng nào?",
      options: [
        "Thể tích tổng cộng của vật rắn đó",
        "Khối lượng m, độ tăng nhiệt độ Δt và nhiệt dung riêng c của chất làm vật",
        "Thời gian đốt nóng bằng bếp lửa"
      ],
      correctIdx: 1,
      tip: "💡 Q = m * c * Δt. Nhiệt lượng cần tỉ lệ thuận với khối lượng, nhiệt dung riêng và độ chênh lệch nhiệt độ."
    },
    {
      question: "Nguyên lý hoạt động chính của các loại nhiệt kế thông dụng (như nhiệt kế thủy ngân, rượu) dựa trên hiện tượng vật lý nào?",
      options: [
        "Hiện tượng cảm ứng từ điện",
        "Sự nở vì nhiệt của chất lỏng",
        "Sự nóng chảy của các kim loại"
      ],
      correctIdx: 1,
      tip: "💡 Khi nhiệt độ tăng, chất lỏng trong nhiệt kế giãn nở dâng cao lên ống chia độ, giúp đo chính xác nhiệt độ."
    }
  ],
  wave: [
    {
      question: "Sóng âm thanh cơ học KHÔNG THỂ truyền qua môi trường nào sau đây?",
      options: [
        "Môi trường chất rắn (sắt, thép)",
        "Môi trường chân không",
        "Môi trường nước nguyên chất"
      ],
      correctIdx: 1,
      tip: "💡 Sóng âm là sóng cơ, cần các phần tử vật chất để truyền dao động cơ học, nên không thể lan truyền qua chân không."
    },
    {
      question: "Độ cao của âm thanh mà tai con người nghe thấy phụ thuộc chủ yếu vào đặc trưng vật lý nào của sóng âm?",
      options: [
        "Biên độ của sóng âm",
        "Tần số của sóng âm",
        "Tốc độ truyền sóng âm"
      ],
      correctIdx: 1,
      tip: "💡 Tần số lớn âm nghe bổng (cao), tần số nhỏ âm nghe trầm (thấp). Biên độ quyết định độ to của âm."
    },
    {
      question: "Khi một sóng âm truyền từ môi trường không khí vào môi trường nước, đại lượng nào sau đây của sóng KHÔNG thay đổi?",
      options: [
        "Tốc độ truyền sóng v",
        "Bước sóng λ của sóng âm",
        "Tần số f của sóng âm"
      ],
      correctIdx: 2,
      tip: "💡 Khi sóng truyền qua các môi trường khác nhau, tần số f luôn giữ nguyên không đổi, trong khi tốc độ và bước sóng thay đổi."
    }
  ],
  freefall: [
    {
      question: "Trong chuyển động rơi tự do (bỏ qua sức cản không khí), gia tốc rơi tự do g phụ thuộc chủ yếu vào:",
      options: [
        "Khối lượng của vật thả rơi",
        "Hình dạng và kích thước của vật rơi",
        "Vĩ độ địa lý và độ cao so với mặt đất của địa điểm thả vật"
      ],
      correctIdx: 2,
      tip: "💡 g phụ thuộc vị trí trên Trái Đất (lớn nhất ở cực, nhỏ nhất ở xích đạo) và giảm dần theo độ cao."
    },
    {
      question: "Chuyển động rơi tự do của một vật là chuyển động thuộc loại:",
      options: [
        "Chuyển động thẳng đều",
        "Chuyển động thẳng nhanh dần đều với gia tốc g",
        "Chuyển động thẳng chậm dần đều"
      ],
      correctIdx: 1,
      tip: "💡 Rơi tự do là chuyển động thẳng nhanh dần đều dưới tác dụng duy nhất của trọng lực."
    },
    {
      question: "Thả hai vật có khối lượng m1 khác m2 rơi tự do từ cùng một độ cao h tại cùng một vị trí. Thời gian chạm đất sẽ thế nào?",
      options: [
        "Vật nặng chạm đất trước vật nhẹ",
        "Hai vật chạm đất cùng một lúc với cùng vận tốc",
        "Vật nhẹ chạm đất trước vật nặng"
      ],
      correctIdx: 1,
      tip: "💡 Bỏ qua lực cản không khí, mọi vật rơi tự do với cùng gia tốc g nên sẽ chạm đất đồng thời."
    }
  ],
  pendulum: [
    {
      question: "Chu kỳ dao động nhỏ của con lắc đơn phụ thuộc vào những đại lượng nào?",
      options: [
        "Khối lượng quả nặng treo ở đầu dây",
        "Chiều dài dây treo l và gia tốc trọng trường g tại nơi treo",
        "Biên độ kéo lệch con lắc ban đầu"
      ],
      correctIdx: 1,
      tip: "💡 T = 2π * sqrt(l / g). Chu kỳ chỉ phụ thuộc vào chiều dài l của dây và gia tốc g."
    },
    {
      question: "Muốn làm cho một con lắc đơn dao động nhanh hơn (giảm chu kỳ dao động), ta cần phải:",
      options: [
        "Giảm chiều dài dây treo l",
        "Tăng chiều dài dây treo l",
        "Tăng khối lượng quả nặng lên gấp đôi"
      ],
      correctIdx: 0,
      tip: "💡 Tỉ lệ thuận với sqrt(l). Giảm l sẽ giảm chu kỳ T, tức con lắc dao động nhanh hơn."
    },
    {
      question: "Một con lắc đơn đang dao động nhỏ, nếu ta tăng khối lượng quả nặng lên 4 lần thì chu kỳ dao động của nó sẽ:",
      options: [
        "Tăng lên gấp đôi",
        "Giảm đi một nửa",
        "Không thay đổi"
      ],
      correctIdx: 2,
      tip: "💡 Chu kỳ con lắc đơn hoàn toàn độc lập với khối lượng m của vật nặng treo."
    }
  ],
  incline: [
    {
      question: "Khi vật trượt không vận tốc đầu từ đỉnh xuống đáy mặt phẳng nghiêng có ma sát, động năng biến đổi thế nào?",
      options: [
        "Giảm dần về không",
        "Tăng lên do thế năng trọng trường chuyển hóa dần sang động năng",
        "Giữ nguyên không thay đổi"
      ],
      correctIdx: 1,
      tip: "💡 Độ cao giảm làm thế năng giảm, chuyển thành động năng làm vật trượt nhanh dần."
    },
    {
      question: "Việc sử dụng mặt phẳng nghiêng để đưa một vật nặng lên cao mang lại cho ta lợi ích lớn về:",
      options: [
        "Lợi về lực kéo (dùng lực nhỏ hơn trọng lượng)",
        "Lợi về đường đi (quãng đường ngắn hơn)",
        "Lợi về công cơ học tiêu thụ"
      ],
      correctIdx: 0,
      tip: "💡 Mặt phẳng nghiêng cho ta lợi về lực kéo nhưng thiệt về đường đi, công tiêu thụ không đổi."
    },
    {
      question: "Lực ma sát trượt tác dụng lên vật trượt trên mặt phẳng nghiêng phụ thuộc chủ yếu vào:",
      options: [
        "Vận tốc trượt của vật trên mặt nghiêng",
        "Chất liệu, độ nhám bề mặt tiếp xúc và độ lớn của áp lực đè lên mặt nghiêng",
        "Diện tích bề mặt tiếp xúc của vật"
      ],
      correctIdx: 1,
      tip: "💡 F_mst = μ * N. Phụ thuộc hệ số ma sát μ (bề mặt) và áp lực pháp tuyến N đè lên mặt nghiêng."
    }
  ],
  mirror: [
    {
      question: "Ảnh của một vật sáng tạo bởi gương phẳng có tính chất vật lý nào sau đây?",
      options: [
        "Ảnh thật, ngược chiều và bằng vật",
        "Ảnh ảo, đối xứng và bằng vật qua mặt phẳng gương",
        "Ảnh ảo, cùng chiều và phóng to hơn vật"
      ],
      correctIdx: 1,
      tip: "💡 Gương phẳng tạo ảnh ảo bằng vật, đối xứng với vật (khoảng cách từ vật đến gương bằng từ ảnh đến gương)."
    },
    {
      question: "Khi dịch chuyển một vật sáng ra xa gương phẳng thêm một khoảng 2 cm thì ảnh của nó sẽ:",
      options: [
        "Dịch chuyển lại gần gương thêm 2 cm",
        "Dịch chuyển ra xa gương thêm 2 cm",
        "Không dịch chuyển"
      ],
      correctIdx: 1,
      tip: "💡 Vì ảnh đối xứng vật qua gương, vật ra xa gương bao nhiêu thì ảnh cũng ra xa gương bấy nhiêu."
    },
    {
      question: "Định luật phản xạ ánh sáng phát biểu rằng mối liên hệ giữa góc tới i và góc phản xạ i' là:",
      options: [
        "Góc tới luôn lớn hơn góc phản xạ",
        "Góc tới luôn bằng góc phản xạ (i = i')",
        "Góc tới luôn nhỏ hơn góc phản xạ"
      ],
      correctIdx: 1,
      tip: "💡 Tia phản xạ nằm trong mặt phẳng tới và ở bên kia pháp tuyến so với tia tới, với góc i' = i."
    }
  ],
  prism: [
    {
      question: "Khi chùm ánh sáng trắng qua lăng kính bị tán sắc, ánh sáng bị lệch về phía đáy lăng kính nhiều nhất là màu nào?",
      options: [
        "Ánh sáng màu đỏ",
        "Ánh sáng màu vàng",
        "Ánh sáng màu tím"
      ],
      correctIdx: 2,
      tip: "💡 Ánh sáng tím có chiết suất lớn nhất nên bị lăng kính bẻ lệch đường đi nhiều nhất về phía đáy."
    },
    {
      question: "Hiện tượng chùm ánh sáng trắng phức tạp đi qua lăng kính bị tách thành dải màu cầu vồng gọi là gì?",
      options: [
        "Hiện tượng phản xạ toàn phần",
        "Hiện tượng tán sắc ánh sáng",
        "Hiện tượng giao thoa ánh sáng"
      ],
      correctIdx: 1,
      tip: "💡 Tán sắc là sự phân tách một chùm ánh sáng phức tạp thành các ánh sáng đơn sắc riêng biệt do chiết suất khác nhau."
    },
    {
      question: "Ánh sáng đơn sắc là chùm ánh sáng có đặc tính đặc biệt nào sau đây?",
      options: [
        "Bị biến đổi sang màu khác khi đi qua lăng kính",
        "Không bị tán sắc và không đổi màu khi đi qua lăng kính",
        "Không bị khúc xạ khi đi từ không khí vào thủy tinh"
      ],
      correctIdx: 1,
      tip: "💡 Ánh sáng đơn sắc có một tần số xác định, không bị lăng kính phân tách hay đổi màu sắc."
    }
  ],
  ohm: [
    {
      question: "Theo định luật Ohm cho đoạn mạch, cường độ dòng điện I tỉ lệ thuận với đại lượng nào?",
      options: [
        "Điện trở R của đoạn mạch",
        "Hiệu điện thế U giữa hai đầu đoạn mạch",
        "Khối lượng dây dẫn"
      ],
      correctIdx: 1,
      tip: "💡 I = U / R. Cường độ dòng điện tỉ lệ thuận với hiệu điện thế U và tỉ lệ nghịch với điện trở R."
    },
    {
      question: "Nếu giữ nguyên hiệu điện thế U giữa hai đầu đoạn mạch và tăng điện trở R lên gấp đôi thì dòng điện I sẽ:",
      options: [
        "Tăng lên gấp đôi",
        "Giảm đi một nửa",
        "Giảm đi bốn lần"
      ],
      correctIdx: 1,
      tip: "💡 Vì I tỉ lệ nghịch với R, R tăng gấp đôi thì dòng điện I giảm còn một nửa."
    },
    {
      question: "Đơn vị đo điện trở trong hệ thống đo lường quốc tế (SI) là:",
      options: [
        "Vôn (V)",
        "Ampe (A)",
        "Ôm (Ω)"
      ],
      correctIdx: 2,
      tip: "💡 Điện trở đo bằng Ôm (Ω), hiệu điện thế đo bằng Vôn (V), cường độ dòng điện đo bằng Ampe (A)."
    }
  ]
};

export default function LabQuizChallenge({ labId }) {
  const navigate = useNavigate();
  const { addXp, unlockBadge, hearts, loseHeart, completeLesson } = useUser();
  const { playSuccess, playError } = useSoundEffects();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedAns, setSelectedAns] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [shouldShake, setShouldShake] = useState(false);

  // Challenge game progression states
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [challengeFinished, setChallengeFinished] = useState(false);

  // Initialize 3 random questions from the bank for the current lab
  const currentQuestionsBank = useMemo(() => {
    const bank = LAB_QUESTIONS_BANK[labId];
    if (!bank) return [];
    
    // Shuffle and pick exactly 3 questions
    const shuffled = [...bank].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [labId, isOpen]); // Re-shuffles only when modal is opened

  useEffect(() => {
    if (isOpen && currentQuestionsBank.length > 0) {
      setQuizQuestions(currentQuestionsBank);
      setCurrentIdx(0);
      setCorrectCount(0);
      setChallengeFinished(false);
      setSelectedAns(null);
      setIsSubmitted(false);
    }
  }, [isOpen, currentQuestionsBank]);

  const activeQuestion = quizQuestions[currentIdx];

  const handleOpen = () => {
    if (hearts <= 0) {
      alert("Hết tim rồi! Cần ít nhất 1 tim để tham gia thử thách. Hãy nạp lại tim ở Bản đồ nhé! ❤️");
      return;
    }
    setIsOpen(true);
  };

  const handleSelect = (idx) => {
    if (isSubmitted) return;
    setSelectedAns(idx);
  };

  const handleSubmit = () => {
    if (selectedAns === null || isSubmitted) return;

    const isCorrect = selectedAns === activeQuestion.correctIdx;

    if (isCorrect) {
      setIsSubmitted(true);
      playSuccess();
      setCorrectCount((prev) => prev + 1);
    } else {
      playError();
      loseHeart();
      setShouldShake(true);
      setTimeout(() => setShouldShake(false), 500);

      setIsSubmitted(true);

      // Check if user has run out of hearts
      if (hearts <= 1) {
        setTimeout(() => {
          setIsOpen(false);
          alert("Hết tim rồi! Hãy quay lại sau khi nạp thêm tim! ❤️");
        }, 1500);
      }
    }
  };

  const handleNext = () => {
    // If we have more questions, move to the next one
    if (currentIdx < quizQuestions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setSelectedAns(null);
      setIsSubmitted(false);
    } else {
      // Finished all 3 questions!
      setChallengeFinished(true);
      
      // If user answered all 3 correctly
      if (correctCount + (selectedAns === activeQuestion.correctIdx ? 1 : 0) === 3) {
        addXp(50);
        unlockBadge('perfect_quiz');

        // Update actual lesson progress
        const lessonMapping = LAB_LESSON_MAP[labId];
        if (lessonMapping) {
          completeLesson(lessonMapping.id, lessonMapping.nextId);
        }

        // Trigger spectacular confetti
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#38BDF8', '#F59E0B', '#10B981', '#EC4899']
        });
      }
    }
  };

  const handleFinish = () => {
    setIsOpen(false);
    if (correctCount === 3) {
      const lessonMapping = LAB_LESSON_MAP[labId];
      const lessonIdParam = lessonMapping ? lessonMapping.id : 'free_exploration';
      navigate(`/achievement/${lessonIdParam}?xp=50`);
    }
  };

  if (!LAB_QUESTIONS_BANK[labId]) return null;

  return (
    <>
      {/* Floating trigger button at top right */}
      <button
        onClick={handleOpen}
        className="absolute top-4 right-16 z-20 px-3.5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-[11px] rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/25 transition-transform active:scale-95 animate-pulse"
      >
        <Award size={14} className="animate-bounce" />
        THỬ THÁCH TRẮC NGHIỆM (+50 XP)
      </button>

      <AnimatePresence>
        {isOpen && quizQuestions.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-md bg-[#0F172A] border-2 border-amber-500/40 rounded-3xl p-6 relative text-white shadow-2xl flex flex-col gap-4"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white bg-white/5 p-1.5 rounded-full transition-colors"
              >
                <X size={16} />
              </button>

              {/* Title Header */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <HelpCircle size={20} className="text-amber-400" />
                  <span className="font-extrabold text-xs text-slate-300 tracking-wider uppercase">
                    Thử thách lý thuyết ({currentIdx + 1}/3)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-500 text-xs font-black">
                  <Heart size={14} fill="currentColor" /> {hearts} tim
                </div>
              </div>

              {/* Duolingo style progress dots */}
              <div className="flex gap-2 w-full justify-between items-center py-1">
                {quizQuestions.map((_, qIdx) => {
                  let dotColor = 'bg-slate-700';
                  if (qIdx < currentIdx) {
                    dotColor = 'bg-emerald-500';
                  } else if (qIdx === currentIdx) {
                    dotColor = isSubmitted
                      ? selectedAns === activeQuestion.correctIdx
                        ? 'bg-emerald-500 animate-pulse'
                        : 'bg-rose-500 animate-pulse'
                      : 'bg-amber-500 animate-pulse';
                  }
                  return <div key={qIdx} className={`h-2 flex-1 rounded-full transition-colors duration-300 ${dotColor}`} />;
                })}
              </div>

              {!challengeFinished ? (
                <>
                  {/* Active Question */}
                  <div className="text-sm font-bold leading-relaxed text-slate-100 py-1 min-h-[50px]">
                    {activeQuestion?.question}
                  </div>

                  {/* Option List */}
                  <motion.div
                    animate={shouldShake ? { x: [0, -10, 10, -10, 10, -5, 5, 0] } : {}}
                    transition={{ duration: 0.4 }}
                    className="flex flex-col gap-2.5"
                  >
                    {activeQuestion?.options.map((opt, idx) => {
                      let borderStyle = "border-white/5 bg-white/3 text-slate-300 hover:bg-white/5";
                      let badge = null;

                      if (isSubmitted) {
                        if (idx === activeQuestion.correctIdx) {
                          borderStyle = "border-emerald-500/60 bg-emerald-500/10 text-emerald-400";
                          badge = <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-extrabold">ĐÚNG</span>;
                        } else if (selectedAns === idx) {
                          borderStyle = "border-rose-500/60 bg-rose-500/10 text-rose-400";
                          badge = <span className="text-[9px] bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded font-extrabold">SAI</span>;
                        } else {
                          borderStyle = "border-white/5 bg-white/1 opacity-50 text-slate-500";
                        }
                      } else if (selectedAns === idx) {
                        borderStyle = "border-amber-500 bg-amber-500/10 text-amber-400 font-bold";
                      }

                      return (
                        <button
                          key={idx}
                          disabled={isSubmitted}
                          onClick={() => handleSelect(idx)}
                          className={`flex justify-between items-center text-left px-4 py-3 rounded-2xl border text-xs leading-normal transition-all ${borderStyle}`}
                        >
                          <span>{opt}</span>
                          {badge}
                        </button>
                      );
                    })}
                  </motion.div>

                  {/* Success Tip / Feedback explanation */}
                  {isSubmitted && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/5 border border-white/5 rounded-2xl p-3 text-[10px] text-slate-300 leading-relaxed"
                    >
                      <p>{activeQuestion?.tip}</p>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-2 flex gap-3">
                    {!isSubmitted ? (
                      <button
                        disabled={selectedAns === null}
                        onClick={handleSubmit}
                        className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 disabled:opacity-50 text-slate-950 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/10 active:scale-95 transition-transform"
                      >
                        NỘP BÀI THỬ THÁCH
                      </button>
                    ) : (
                      <button
                        onClick={handleNext}
                        className={`w-full py-3.5 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-colors ${
                          selectedAns === activeQuestion.correctIdx
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                        }`}
                      >
                        <span>
                          {currentIdx === quizQuestions.length - 1 ? 'HOÀN THÀNH' : 'CÂU TIẾP THEO'}
                        </span>
                        <ArrowRight size={14} />
                      </button>
                    )}
                  </div>
                </>
              ) : (
                /* Challenge Ending Screen */
                <div className="text-center py-4 flex flex-col items-center gap-4">
                  {correctCount === 3 ? (
                    <>
                      <div className="text-5xl animate-bounce">🏆</div>
                      <h3 className="text-lg font-black text-amber-400">THỬ THÁCH HOÀN TẤT MỸ MÃN!</h3>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-xs">
                        Bạn đã trả lời đúng xuất sắc liên tiếp 3 câu hỏi thực nghiệm! Nhận ngay <strong>+50 XP</strong> và mở khóa bài học tiếp theo.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-5xl">😢</div>
                      <h3 className="text-lg font-black text-slate-300">CHƯA THÀNH CÔNG</h3>
                      <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                        Bạn cần vượt qua hoàn chỉnh 3/3 câu hỏi để nhận phần thưởng điểm. Hãy luyện tập thêm ở các phòng mô phỏng và thử lại nhé!
                      </p>
                    </>
                  )}

                  <button
                    onClick={handleFinish}
                    className={`w-full py-3.5 font-extrabold rounded-2xl text-xs mt-2 flex items-center justify-center gap-1.5 transition-colors ${
                      correctCount === 3
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-200'
                    }`}
                  >
                    {correctCount === 3 ? 'NHẬN THƯỞNG & ĂN MỪNG 🎉' : 'QUAY LẠI PHÒNG LAB'}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
