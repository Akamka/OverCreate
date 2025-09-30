<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    public function up(): void
    {
        // 1) Нормализация существующих значений
        DB::statement("UPDATE portfolios SET service_type = LOWER(TRIM(service_type))");

        // Разрешённые значения ENUM
        $allowed = ['web','motion','graphic','dev','printing'];
        $allowedList = "'" . implode("','", $allowed) . "'";

        // Заменяем любые «левые» значения на web
        DB::statement("
            UPDATE portfolios
            SET service_type = 'web'
            WHERE service_type IS NULL
               OR service_type NOT IN ($allowedList)
        ");

        // 2) Безопасно меняем тип на ENUM (НЕ трогаем индекс)
        DB::statement("
            ALTER TABLE portfolios
            MODIFY COLUMN service_type
            ENUM($allowedList) NOT NULL DEFAULT 'web'
        ");

        // 3) На всякий случай — убеждаемся, что индекс есть. Добавляем ТОЛЬКО если его нет
        $idxExists = DB::selectOne("
            SELECT COUNT(*) AS cnt
            FROM INFORMATION_SCHEMA.STATISTICS
            WHERE TABLE_SCHEMA = DATABASE()
              AND TABLE_NAME = 'portfolios'
              AND INDEX_NAME = 'portfolios_service_type_index'
        ")->cnt ?? 0;

        if ((int)$idxExists === 0) {
            DB::statement("CREATE INDEX portfolios_service_type_index ON portfolios(service_type)");
        }
    }

    public function down(): void
    {
        // Возвращаем VARCHAR(50); индекс не трогаем, он есть в базовой миграции
        DB::statement("
            ALTER TABLE portfolios
            MODIFY COLUMN service_type VARCHAR(50) NOT NULL
        ");
    }
};
