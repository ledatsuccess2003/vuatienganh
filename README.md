# Vua Tiếng Anh

Ứng dụng React/Vite dành cho người học Việt Nam, tập trung vào trò chơi và ôn tập từ vựng. Dự án riêng, không thay đổi website Trung/Nhật/Hàn đang có.

## Website đang chạy

- Vercel production: https://vuatienganh.vercel.app/
- GitHub Pages: https://ledatsuccess2003.github.io/vuatienganh/
- Mã nguồn: https://github.com/ledatsuccess2003/vuatienganh

Vercel đã kết nối repository, nhánh production main, dự án Dat/vuatienganh. Push main tự tạo deployment mới. Website công khai qua HTTPS, không yêu cầu tài khoản Vercel để học.

## Tính năng

- 3.000 từ riêng biệt, 21 chủ đề, nghĩa tiếng Việt, IPA Anh–Anh/Anh–Mỹ và ví dụ chứa từ.
- 5 game: phiêu lưu chọn nghĩa, nghe–viết từ, điền từ trong câu, ghép cặp, thử thách 3 trái tim.
- Flashcards, 4 mức nhớ, lịch ôn giãn cách dùng chung với game, luyện lại từ sai.
- Yêu thích, tìm kiếm, ghi âm/nghe lại, nhận diện văn bản khi trình duyệt hỗ trợ, bảng 44 âm IPA.
- XP, xu học tập, cấp độ, huy hiệu, streak và mục tiêu hằng ngày.
- PWA cài lên màn hình chính; cache giao diện và toàn bộ kho từ để học offline.
- Nhắc khi app mở; xuất tệp Lịch lặp hằng ngày để nhắc khi app đóng.
- Tiến độ lưu riêng trên thiết bị; xuất/nhập JSON để sao lưu và chuyển thiết bị.
- Responsive 320px trở lên; điều hướng bàn phím, focus trap, giảm chuyển động, vùng an toàn iOS.

## Chạy

Node.js 20+:

    npm ci
    npm run dev

    npm run validate
    npm test
    npm run build
    npm run preview -- --port 5194

Kiểm thử trình duyệt:

    npx playwright install chromium
    npm run test:e2e

Đặt CHROME_PATH nếu dùng trình duyệt có sẵn. BASE_URL có thể trỏ đến bản đã triển khai. Playwright không sử dụng hồ sơ trình duyệt cá nhân.

## Nguồn dữ liệu

Kho từ hỗ trợ học IELTS gồm từ nền tảng và học thuật, không phải danh sách chính thức của IELTS, không bảo đảm band điểm hay độ chính xác 100%.

- Nghĩa/ví dụ: Skypedia English–Vietnamese Dictionary, kế thừa MinhQND, Wiktionary và nguồn mở được ghi trong public/ATTRIBUTION.md. Ví dụ nguồn có phần sinh bằng máy và chưa thẩm định độc lập toàn bộ.
- IPA: open-dict-data/ipa-dict, en_UK và en_US. Bổ sung IPA sustainable, biodiversity, misinformation được đối chiếu trực tiếp với mục từ English Wiktionary.
- Tần suất: first20hours/google-10000-english, danh sách không có từ tục.
- 59 mục nổi bật được sửa nghĩa, biên soạn ví dụ, dịch câu và thêm collocation; xem content-report.json. Không xem biên soạn của ứng dụng là chứng nhận của chuyên gia.
- Dữ liệu phái sinh/biên soạn: CC BY-SA 4.0. Mã ứng dụng: MIT.

Mỗi từ giữ trường source và exampleSource. public/content-report.json chứa số lượng và SHA-256 dữ liệu đầu vào/đầu ra. public/vocabulary.json đã được đóng gói, không cần API hay download database khi người dùng học.

### Tái tạo dữ liệu

Tạo thư mục data-source/ (không đưa lên Git) và tải các tệp:

- dictionary.db: https://raw.githubusercontent.com/skypediacode/english-vietnamese-dictionary/main/dictionary_en_vi.db
- en_UK.txt: https://raw.githubusercontent.com/open-dict-data/ipa-dict/master/data/en_UK.txt
- en_US.txt: https://raw.githubusercontent.com/open-dict-data/ipa-dict/master/data/en_US.txt
- frequency.txt: https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english-no-swears.txt

Chạy python scripts/build-data.py. Bộ tạo yêu cầu đủ 3.000 từ thật đạt điều kiện, không thêm dữ liệu giả để đủ số lượng. Ưu tiên từ chủ đề và mục biên soạn, rồi từ phổ biến; kiểm tra phiên âm, nghĩa có nội dung, ví dụ chứa đúng từ, và tránh một số mẫu ví dụ rỗng/generic.

## Âm thanh và quyền riêng tư

SpeechSynthesis dùng giọng của thiết bị, không có API trả phí. Nếu không có giọng tiếng Anh, app hiển thị hướng dẫn. Ghi âm cần HTTPS hoặc localhost và quyền micro; file chỉ ở bộ nhớ thiết bị. SpeechRecognition có thể sử dụng dịch vụ trình duyệt, không phải chấm âm vị hay điểm IELTS. Nhắc học khi đóng app dựa vào ứng dụng Lịch, không có máy chủ push. Không có đăng nhập hay đồng bộ đám mây.

## Website miễn phí trên GitHub Pages

Link học: https://ledatsuccess2003.github.io/vuatienganh/

Workflow .github/workflows/pages.yml kiểm tra dữ liệu, chạy test, build với SITE_BASE=/vuatienganh/ và xuất bản tự động khi push main. HTTPS và tên miền con do GitHub cung cấp. Đây là hosting frontend tĩnh; toàn bộ chức năng học hiện tại chạy trong trình duyệt, không cần backend. Tiến độ vẫn lưu trên từng thiết bị, có xuất/nhập để sao lưu.

GitHub Pages không chạy backend. Khi cần đăng nhập/đồng bộ, có thể triển khai cùng code lên Vercel hoặc Cloudflare Workers và thêm dịch vụ API/database phù hợp; chưa cấu hình backend trong bản hiện tại.

## GitHub → Vercel

Repository đã được import trực tiếp vào Vercel và kết nối Git thành công. Các lệnh sau dành cho trường hợp triển khai sang một tài khoản hoặc dự án khác:

    npx vercel --prod
    npx vercel git connect https://github.com/ledatsuccess2003/vuatienganh.git

Framework Vite. Build: npm run validate && npm run build. Output: dist. Production branch: main. Không cần biến môi trường. Vercel tự build khi push vào main sau khi kết nối Git thành công.

## Giới hạn kiểm chứng

Test tự động xác minh scheduling, lưu tiến độ, đáp án, hoàn thành game, PWA offline và kích thước viewport. Không thay thế thử nghiệm micro/âm thanh trên iPhone/iPad/Android thật hay thẩm định ngôn ngữ 3.000 mục bởi giáo viên.


## E-book A: lộ trình và bộ nhớ riêng

- Truy cập: https://vuatienganh.vercel.app/#ebook-a
- Nguồn do chủ website cung cấp: `ebook-khoa-hoc-ielts-vocabulary.pdf`, IELTS Vocabulary — IELTS Nguyễn Huyền, 114 trang.
- `public/ebook-a.json`: 826 mục theo thứ tự sách, gồm 300 cụm chính (20 cụm × 15 chủ đề) và 526 mục học thêm. Giữ mục lặp theo ngữ cảnh, số trang, ví dụ song ngữ và ghi chú các lỗi nguồn đã sửa. Đây là các đầu mục từ vựng của phần lý thuyết, không phải danh sách mọi từ đơn xuất hiện trong các câu của PDF. Bài luyện tương tác được tạo từ từ đã học, không phải bản sao các trang bài tập giấy.
- Chỉ nút xác nhận đã học mới mở khóa mục kế tiếp và đưa mục vào nhóm ôn. Ghi chú hoặc yêu thích không tự đánh dấu đã học. Câu hỏi, phương án nhiễu và cặp ghép đều lấy từ nhóm đã học; không dùng kho 3.000 từ làm nhiễu cho e-book.
- 6 cách ôn: flashcards, chọn nghĩa, chọn tiếng Anh, viết nghĩa, điền tiếng Anh, ghép cặp. Bài viết cho tự đối chiếu để tránh chấm sai các bản dịch tương đương. Đánh giá cập nhật lịch SRS; chưa nhớ ôn lại sau 10 phút.
- IndexedDB `vua-english-ebook-a` có hai object stores `cards` và `events`. Lưu thẻ và lịch sử bằng một giao dịch; chỉ chuyển bài khi ghi thành công. Lịch sử không tự cắt bỏ, UI tải thêm từng 30 mục. Ghi chú được lưu khi nhấn nút lưu hoặc xác nhận học và tiếp tục. Bản sao JSON chứa toàn bộ thẻ và lịch sử, nhập hợp nhất theo ID và thời điểm cập nhật, không lặp sự kiện.
- Bộ nhớ khác nhau theo thiết bị, trình duyệt và origin; GitHub Pages và Vercel không chung dữ liệu. Có nút yêu cầu persistent storage; trình duyệt quyết định cấp quyền. Xóa dữ liệu trình duyệt vẫn xóa tiến độ, vì vậy cần xuất bản sao định kỳ. Không có đồng bộ máy chủ hay tài khoản. Lịch sử chỉ tăng theo hoạt động thật, không làm tăng dữ liệu nhân tạo.
- E-book được cache để học ngoại tuyến sau lần tải thành công. Giọng đọc phụ thuộc giọng có sẵn trên thiết bị, có thể cần mạng tùy giọng.
- Sách không có IPA. IPA bổ sung từ open-dict-data/ipa-dict, trình bày theo từng từ với giọng UK/US khi nguồn có, không ghép giả thành phiên âm nối âm. Không khẳng định thẩm định 100% mọi phát âm/nghĩa. Các lỗi nguồn rõ ràng được ghi chú ngay trong bài.

Tái tạo dữ liệu: `python scripts/import-ebook.py <đường-dẫn-PDF>` (pypdf; các tệp IPA nằm trong data-source theo hướng dẫn trên). SHA-256 của PDF được lưu trong JSON. Không đưa tệp PDF gốc lên repo. Nội dung e-book được nhập theo yêu cầu chủ website; không gán giấy phép CC BY-SA của từ điển hoặc MIT của code cho sách của tác giả. Giấy phép IPA tiếp tục nằm trong `public/IPA-LICENSE.txt`.
