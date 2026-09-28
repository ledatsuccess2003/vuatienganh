# Vua Tiếng Anh

Ứng dụng React/Vite dành cho người học Việt Nam, tập trung vào trò chơi và ôn tập từ vựng. Dự án riêng, không thay đổi website Trung/Nhật/Hàn đang có.

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

Import repository vào Vercel hoặc chạy Vercel CLI, rồi kết nối Git:

    npx vercel --prod
    npx vercel git connect https://github.com/ledatsuccess2003/vuatienganh.git

Framework Vite. Build: npm run validate && npm run build. Output: dist. Production branch: main. Không cần biến môi trường. Vercel tự build khi push vào main sau khi kết nối Git thành công.

## Giới hạn kiểm chứng

Test tự động xác minh scheduling, lưu tiến độ, đáp án, hoàn thành game, PWA offline và kích thước viewport. Không thay thế thử nghiệm micro/âm thanh trên iPhone/iPad/Android thật hay thẩm định ngôn ngữ 3.000 mục bởi giáo viên.
