PGDMP                      }            weather_efficiency_db    17.3    17.3     �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            �           1262    17404    weather_efficiency_db    DATABASE     {   CREATE DATABASE weather_efficiency_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'pt-BR';
 %   DROP DATABASE weather_efficiency_db;
                     postgres    false            �            1259    17415    current_weather    TABLE       CREATE TABLE public.current_weather (
    id integer NOT NULL,
    city character varying(100) NOT NULL,
    temperature double precision NOT NULL,
    efficiency double precision NOT NULL,
    datetime timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
 #   DROP TABLE public.current_weather;
       public         heap r       postgres    false            �            1259    17414    current_weather_id_seq    SEQUENCE     �   CREATE SEQUENCE public.current_weather_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 -   DROP SEQUENCE public.current_weather_id_seq;
       public               postgres    false    218            �           0    0    current_weather_id_seq    SEQUENCE OWNED BY     Q   ALTER SEQUENCE public.current_weather_id_seq OWNED BY public.current_weather.id;
          public               postgres    false    217                        2604    17418    current_weather id    DEFAULT     x   ALTER TABLE ONLY public.current_weather ALTER COLUMN id SET DEFAULT nextval('public.current_weather_id_seq'::regclass);
 A   ALTER TABLE public.current_weather ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    217    218    218            �          0    17415    current_weather 
   TABLE DATA           V   COPY public.current_weather (id, city, temperature, efficiency, datetime) FROM stdin;
    public               postgres    false    218          �           0    0    current_weather_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.current_weather_id_seq', 548, true);
          public               postgres    false    217            #           2606    17421 $   current_weather current_weather_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.current_weather
    ADD CONSTRAINT current_weather_pkey PRIMARY KEY (id);
 N   ALTER TABLE ONLY public.current_weather DROP CONSTRAINT current_weather_pkey;
       public                 postgres    false    218            �   �   x��ν�@���n
�e;��d
��RE���������p���{�~*��K����ڷ�H�$�&F�u ?��d3
�����iy�:�꺴����A)�EC��j40�9��V��#���Z��c�����j��S��/�'
��*Z�t:R��o�y�@����a�     