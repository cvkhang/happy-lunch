# スプリントバックログ (Sprint Backlog)

**期間 (Thời gian):** 2025/11/19 〜 2025/11/25

**スプリントゴール (Mục tiêu Sprint):**
このスプリントの以下のタスクを全て完了させることで、ユーザーはレストランのリストとその詳細情報を閲覧できます。
(Hoàn thành tất cả các task trong sprint này để người dùng có thể xem danh sách nhà hàng và thông tin chi tiết.)

| No | 機能名 (Tên chức năng) | タスク名 (Tên task) | タスクの詳細説明 (Mô tả chi tiết) | 担当者 (Người phụ trách) | 進捗度 (Tiến độ) | 問題点・原因 (Vấn đề) |
|:--:|:---|:---|:---|:--:|:--:|:---|
| 1 | **GitHub環境構築**<br>Thiết lập môi trường GitHub | **リポジトリ作成**<br>Tạo Repository | GitHub上に新規リポジトリを作成し、初期設定（プライベート/パブリック設定など）を行う。<br>Tạo repository mới trên GitHub và thực hiện cài đặt ban đầu (cài đặt private/public, v.v.). | Khang | 0% | |
| | | **README整備**<br>Chuẩn bị README | プロジェクトの概要、目的、実行方法、環境構築手順などを記載したREADME.mdを作成する。<br>Tạo README.md bao gồm tổng quan dự án, mục tiêu, cách thực hiện, quy trình thiết lập môi trường, v.v. | | 0% | |
| | | **共有手順の確立と周知**<br>Thiết lập và thông báo quy trình chia sẻ | チームメンバーへの招待、権限設定、コード共有・レビューの手順を明確化し、チーム全体に共有する。<br>Xác định rõ ràng quy trình mời thành viên, thiết lập quyền hạn, và quy trình chia sẻ/review code, sau đó thông báo cho toàn bộ team. | | 0% | |
| 2 | **データベース**<br>Cơ sở dữ liệu | **データベース基盤の決定**<br>Quyết định nền tảng database | チーム内で話し合い、使用するデータベースの種類（MySQL、PostgreSQL、MongoDBなど）と、開発で使用する技術スタックを決定する。<br>Thảo luận trong nhóm để lựa chọn loại cơ sở dữ liệu (MySQL, PostgreSQL, MongoDB,…) và quyết định công nghệ dùng để phát triển và lưu trữ dữ liệu. | Đạt | 0% | |
| | | **DB設計**<br>Thiết kế DB | レストラン情報、メニュー、評価などを保存するためのテーブル構造・カラム・リレーションを設計する。<br>Thiết kế cấu trúc database: bảng, cột, quan hệ để lưu trữ thông tin nhà hàng, menu món ăn và đánh giá. | Hương | 0% | |
| | | **サンプルデータ作成**<br>Tạo dữ liệu mẫu | 動作確認用に、レストラン名・場所・画像URL・メニュー・評価などのサンプルデータをDBに登録する。<br>Thêm dữ liệu mẫu vào database (tên nhà hàng, địa chỉ, ảnh, menu, đánh giá) để kiểm tra hoạt động. | Hương | 0% | |
| 3 | **レストラン情報表示機能**<br>Chức năng hiển thị thông tin nhà hàng | **UI/UX設計**<br>Thiết kế UI/UX | レストラン一覧を表示する画面のレイアウト、色、情報配置を設計する。店名・住所・評価・画像などを見やすく整理し、ユーザーが使いやすいデザインを作成する。<br>Thiết kế bố cục giao diện web hiển thị danh sách nhà hàng: cách sắp xếp tên, địa chỉ, đánh giá, hình ảnh. Tạo giao diện dễ nhìn và dễ sử dụng cho người dùng. | Đạt | 0% | |
| | | **REST API設計・実装**<br>Thiết kế & tạo API | データベースと接続し、レストラン情報（名前、メニュー、評価、位置情報）を取得するREST APIを設計・実装する。正確なデータが返せるように動作を確認する。<br>Thiết kế và xây dựng REST API kết nối database để lấy thông tin nhà hàng (tên, menu món ăn, đánh giá, vị trí). Đảm bảo API hoạt động đúng và trả về dữ liệu chính xác. | Dương | 0% | |
| | | **フロント側データ表示実装**<br>Hiển thị dữ liệu lên web | APIから取得したレストラン情報をフロントエンドで表示する。レストラン一覧、画像、メニュー、評価などを画面に正しく反映させ、動作確認を行う。<br>Lấy dữ liệu nhà hàng từ API và hiển thị lên giao diện web. Hiển thị danh sách, hình ảnh, menu, đánh giá và kiểm tra hiển thị đúng, hoạt động mượt. | Dương | 0% | |
| 4 | **レストラン一覧**<br>Danh sách nhà hàng | **詳細画面設計**<br>Thiết kế màn hiển thị danh sách | レストランの詳細情報を表示する画面を設計する。(店名、住所、評価など)<br>Thiết kế màn hiển thị danh sách nhà hàng. Giao diện này chỉ hiển thị các thông tin tên nhà hàng, địa chỉ và đánh giá sao.<br><br>- UI/UXの概念化/設計 (Lên ý tưởng/Thiết kế UI/UX)<br>- レストラン情報を返すREST APIの作成 (Tạo REST API trả về thông tin nhà hàng)<br>- バックエンドから取得したデータをインターフェースに表示する (Hiển thị dữ liệu lấy từ backend lên giao diện) | Đạt | 0% | |
| | | **レストランを探す**<br>Tìm kiếm nhà hàng | - UI/UXの概念化/設計 (Lên ý tưởng/Thiết kế UI/UX)<br>- レストラン情報を返すREST APIの作成 (Tạo REST API trả về thông tin nhà hàng)<br>- バックエンドから取得したデータをインターフェースに表示する (Hiển thị dữ liệu lấy từ backend lên giao diện) | Minh | 0% | |
| | | **レストランの提案**<br>Gợi ý nhà hàng | UI/UXデザイン。レストラン情報を取得するためのAPIを作成。半径3km以内のレストランを提案する。<br>Thiết kế UI/UX. Tạo API lấy thông tin nhà hàng. Đảm bảo trong vòng bán kính 3km. | Minh | 0% | |