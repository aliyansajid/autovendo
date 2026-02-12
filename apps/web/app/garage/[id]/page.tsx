"use client";

import { garagePageData } from "../../../lib/mock-data";
import { ListingCard } from "../../../components/listing-card";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import { Separator } from "@repo/ui/components/separator";
import {
  MapPin,
  Phone,
  Mail,
  Users,
  Calendar,
  Globe,
  CheckCircle2,
  Share2,
  Briefcase,
  Clock,
} from "lucide-react";
import Image from "next/image";

export default function GaragePage() {
  const { garage, listings } = garagePageData;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-16">
      {/* Cover Image */}
      <div className="h-48 md:h-64 lg:h-80 w-full relative bg-gray-200">
        <Image
          src={garage.coverImage}
          alt="Cover"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Garage Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Garage Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 space-y-6">
                {/* Header */}
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-md bg-white overflow-hidden">
                    {/* Placeholder for logo */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
                      <Users className="w-12 h-12" />
                    </div>
                    {garage.logo && (
                      <Image
                        src={garage.logo}
                        alt={garage.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
                      {garage.name}
                      {garage.isVerified && (
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      )}
                    </h1>
                    <div className="flex items-center justify-center gap-1.5 mt-1 text-sm text-gray-600">
                      <div className="flex text-yellow-400">
                        {"★".repeat(Math.round(garage.rating))}
                      </div>
                      <span className="font-semibold text-gray-900">
                        {garage.rating}
                      </span>
                      <span>({garage.reviewCount} reviews)</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Contact Info */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="text-sm font-medium text-gray-900 leading-snug">
                        {garage.address}
                      </p>
                    </div>
                  </div>

                  {garage.phones.length > 0 && (
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <div className="space-y-1">
                          {garage.phones.map((phone, i) => (
                            <a
                              key={i}
                              href={`tel:${phone}`}
                              className="block text-sm font-medium text-blue-600 hover:underline"
                            >
                              {phone}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {garage.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <a
                          href={`mailto:${garage.email}`}
                          className="text-sm font-medium text-blue-600 hover:underline break-all"
                        >
                          {garage.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {garage.website && (
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600">Website</p>
                        <a
                          href={`https://${garage.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          {garage.website}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Established</p>
                      <p className="text-sm font-medium text-gray-900">
                        {garage.established}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button className="w-full">Contact</Button>
                  <Button variant="outline" className="w-full">
                    <Share2 /> Share
                  </Button>
                </div>
              </div>
            </div>

            {/* Services Offered */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-500" />
                Services
              </h3>
              <div className="flex flex-wrap gap-2">
                {garage.services.map((service, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="font-normal text-gray-700"
                  >
                    {service}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Opening Hours */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                Opening Hours
              </h3>
              <div className="space-y-3">
                {garage.openingHours.map((slot, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-600">{slot.day}</span>
                    <span className="font-medium text-gray-900">
                      {slot.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Listings & About */}
          <div className="lg:col-span-2 space-y-8">
            {/* About Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-12 lg:mt-0">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                About {garage.name}
              </h2>
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                {garage.about}
              </div>
              <div className="flex flex-wrap gap-2 mt-6">
                {garage.languages.map((lang, i) => (
                  <Badge key={i} variant="outline" className="px-3 py-1">
                    {lang} spoken
                  </Badge>
                ))}
              </div>
            </div>

            {/* Listings Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Current Inventory
                  <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {listings.length}
                  </span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {listings.map((item) => (
                  <div key={item.id} className="h-full">
                    {/* @ts-ignore - mismatch in location prop type */}
                    <ListingCard item={item} />
                  </div>
                ))}
              </div>

              {listings.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
                  <p className="text-gray-500">
                    No listings found for this garage.
                  </p>
                </div>
              )}

              <div className="mt-8 flex justify-center">
                <Button variant="outline" size="lg">
                  Load More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
