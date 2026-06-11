-- 1. Criar Tabela de Eventos (events)
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date DATE NOT NULL,
    location TEXT NOT NULL,
    suggested_gift_value NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Criar Tabela de Participantes (participants)
CREATE TABLE IF NOT EXISTS public.participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    token UUID NOT NULL DEFAULT gen_random_uuid(),
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Criar Tabela de Sorteios (draws)
CREATE TABLE IF NOT EXISTS public.draws (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    performed_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Criar Tabela de Resultados do Sorteio (draw_results)
CREATE TABLE IF NOT EXISTS public.draw_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_id UUID REFERENCES public.draws(id) ON DELETE CASCADE,
    giver_participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE,
    receiver_participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE
);

-- 5. Criar Tabela de Lista de Desejos (wishlists)
CREATE TABLE IF NOT EXISTS public.wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID REFERENCES public.participants(id) ON DELETE CASCADE UNIQUE,
    wish_1 TEXT NOT NULL,
    wish_2 TEXT NOT NULL,
    wish_3 TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- Configuração de Segurança (RLS - Row Level Security)
-- ==========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela 'events' (Organizador)
CREATE POLICY "Permitir tudo para o organizador dono do evento" ON public.events
    FOR ALL
    TO authenticated
    USING (auth.uid() = organizer_id)
    WITH CHECK (auth.uid() = organizer_id);

-- Políticas para a tabela 'participants' (Organizador e Acesso Público via Token)
CREATE POLICY "Permitir leitura de participantes para o organizador" ON public.participants
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Permitir inserção e modificação para o organizador" ON public.participants
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Permitir acesso público a participantes por token" ON public.participants
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Políticas para a tabela 'draws'
CREATE POLICY "Permitir tudo sobre sorteios para organizadores autenticados" ON public.draws
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Políticas para a tabela 'draw_results'
CREATE POLICY "Permitir tudo sobre resultados para usuários e participantes" ON public.draw_results
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Políticas para a tabela 'wishlists'
CREATE POLICY "Permitir leitura e gravação pública de listas de desejos" ON public.wishlists
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);
