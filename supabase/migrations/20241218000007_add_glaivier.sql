-- Add 槍術士 (Glaivier) job

-- Insert 槍術士 into 女格鬥 category
insert into public.jobs (name, category_id, role, logo, description, english_name)
select '槍術士', id, 'DPS', '/icons/jobs/glaivier.png', '使用雙劍與長槍的靈活戰士', 'Glaivier'
from public.job_categories where name = '女格鬥'
on conflict (name) do nothing;
